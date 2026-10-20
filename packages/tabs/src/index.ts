import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import { resolveAttributes } from "comark/render";
import { textContent } from "comark/utils";

export type TabsMeta = {
  /** One readable sentence per problem with a `::tabs`, `::code-group`, or `:::tabs-item`. Empty when there are none. */
  issues: string[];
};

type Data = Parameters<typeof resolveAttributes>[1];

const isElement = (node: Node | undefined): node is ElementNode =>
  Array.isArray(node) && node[0] !== null;
// Comments are arrays with a null tag and render nothing, so they aren't tabs either.
const isContent = (node: Node) => (Array.isArray(node) ? node[0] !== null : node.trim() !== "");
// SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
const childrenOf = (node: ElementNode) => node.slice(2) as Node[];
const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean).trim();
const clip = (value: string) => {
  const words = value.trim().replace(/\s+/g, " ");
  return words.length > 40 ? `${words.slice(0, 39)}…` : words;
};
const KINDS = new Map([
  ["p", "paragraph"],
  ["pre", "code block"],
  ["img", "image"],
  ["blockquote", "quote"],
  ["ul", "list"],
  ["ol", "list"],
  ["table", "table"],
]);

function describe(node: Node) {
  if (!Array.isArray(node)) return `the text "${clip(node)}"`;
  if (!isElement(node)) return "a comment";
  const [tag, attrs] = node;
  const kind =
    KINDS.get(tag) ??
    (/^h[1-6]$/.test(tag) ? "heading" : `\`${tag === "tabs-item" ? ":::" : "::"}${tag}\` block`);
  const words = clip(tag === "img" ? text(attrs.alt) : textContent(node));
  return `the ${kind}${words ? ` "${words}"` : ""}`;
}

interface Walk {
  data: Data;
  issues: string[];
  tabs: number;
  groups: number;
  strays: number;
  blocks: number;
  prefix: string;
}

// FNV-1a of the source. Ids from it differ between documents on one page, and from the ids authors write, yet stay
// the same every time a document renders.
function hash(text: string) {
  let value = 0x811c9dc5;
  for (let at = 0; at < text.length; at++)
    value = Math.imul(value ^ text.charCodeAt(at), 0x01000193);
  return (value >>> 0).toString(36);
}

const resolve = (node: ElementNode, walk: Walk) =>
  resolveAttributes(node[1], walk.data, { parseJson: true });

// A code group is `::tabs` with a code block in each tab, so every renderer handles one shape.
function codeGroup(node: ElementNode, walk: Walk) {
  const name = `\`::code-group\` ${++walk.groups}`;
  const items: ElementNode[] = [];
  for (const child of childrenOf(node).filter(isContent)) {
    if (!isElement(child) || child[0] !== "pre") {
      walk.issues.push(
        `${name}: only code blocks go inside. Move ${describe(child)} out, or use \`::tabs\`.`,
      );
      continue;
    }
    let label = text(child[1].filename);
    if (!label) {
      label = text(child[1].language) || `Code ${items.length + 1}`;
      walk.issues.push(
        `${name}, block ${items.length + 1}: a code block needs a label. Put it in brackets after the language: \`\`\`bash [npm].`,
      );
    }
    // The tab names the block, so its own title bar doesn't repeat it.
    delete child[1].filename;
    items.push(["tabs-item", { label }, child]);
  }
  node[0] = "tabs";
  node[1].code = "true";
  node.splice(2, node.length - 2, ...items);
  return name;
}

function tabs(node: ElementNode, walk: Walk) {
  const name = node[0] === "code-group" ? codeGroup(node, walk) : `\`::tabs\` ${++walk.tabs}`;
  const attrs = resolve(node, walk);
  const items: ElementNode[] = [];
  for (const child of childrenOf(node).filter(isContent)) {
    if (isElement(child) && child[0] === "tabs-item") items.push(child);
    else
      walk.issues.push(
        `${name}: put each tab in \`:::tabs-item{label="..."}\`. Found ${describe(child)} outside a tab, so it doesn't render.`,
      );
  }
  if (!items.length)
    walk.issues.push(
      node[1].code
        ? `${name} has no code blocks. Put fenced code blocks inside it, or remove it.`
        : `${name} has no tabs. Put \`:::tabs-item{label="..."}\` blocks inside it, or remove it.`,
    );
  const labels: string[] = [];
  for (const [index, item] of items.entries()) {
    let label = text(resolve(item, walk).label);
    if (!label) {
      label = `Tab ${index + 1}`;
      walk.issues.push(
        `${name}, tab ${index + 1}: \`label\` is required. Write \`:::tabs-item{label="..."}\`.`,
      );
    }
    if (labels.includes(label))
      walk.issues.push(
        `${name}: two tabs are labelled "${label}". Labels must differ, because \`sync\` matches tabs by label.`,
      );
    labels.push(label);
    item[1] = { label, index: String(index + 1) };
  }
  const sync = text(attrs.sync);
  const code = node[1].code;
  node[1] = { uid: `${walk.prefix}-${++walk.blocks}`, count: String(items.length), labels };
  if (sync) node[1].sync = sync;
  if (code) node[1].code = "true";
  node.splice(2, node.length - 2, ...items);
}

// Every renderer gets tabs with their label and position, so none of them has to split rendered children.
function normalize(nodes: Node[], walk: Walk, inTabs = false) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "tabs-item" && !inTabs) {
      const label = text(resolve(node, walk).label);
      walk.issues.push(
        `\`:::tabs-item\` ${++walk.strays}${label ? ` ("${label}")` : ""} sits outside \`::tabs\`, so it renders as plain content. Wrap it in \`::tabs\`, or remove the \`:::tabs-item\` fence.`,
      );
      node[0] = "div";
      node[1] = {};
    }
    if (node[0] === "tabs" || node[0] === "code-group") tabs(node, walk);
    normalize(childrenOf(node), walk, node[0] === "tabs");
  }
}

/**
 * Turns `::tabs` with `:::tabs-item{label}` blocks, and `::code-group` with labelled code blocks, into tabs. Without a
 * script every tab shows under its label; the script adds the tab strip, keys, and `sync`. Problems, such as content
 * outside every tab, are added to `meta.issues`.
 */
export default defineComarkPlugin<void, TabsMeta>(() => ({
  name: "comark-tabs",
  post(state) {
    const { tree } = state;
    const walk: Walk = {
      data: { frontmatter: tree.frontmatter, meta: tree.meta, data: {}, props: {} },
      issues: [],
      tabs: 0,
      groups: 0,
      strays: 0,
      blocks: 0,
      prefix: `ct-${hash(state.markdown)}`,
    };
    normalize(tree.nodes, walk);
    tree.meta.issues = [...(tree.meta.issues ?? []), ...walk.issues];
  },
}));

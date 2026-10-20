import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import { resolveAttributes } from "comark/render";
import { textContent } from "comark/utils";

export type CarouselMeta = {
  /** One readable sentence per problem with a `::carousel` or `:::slide`. Empty when the document has none. */
  issues: string[];
};

type Data = Parameters<typeof resolveAttributes>[1];

const isElement = (node: Node | undefined): node is ElementNode =>
  Array.isArray(node) && node[0] !== null;
// Comments are arrays with a null tag and render nothing, so they aren't slides either.
const isContent = (node: Node) => (Array.isArray(node) ? node[0] !== null : node.trim() !== "");
const isSlide = (node: Node): node is ElementNode => isElement(node) && node[0] === "slide";
// SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
const childrenOf = (node: ElementNode) => node.slice(2) as Node[];
const hasImage = (nodes: Node[]): boolean =>
  nodes.some((node) => isElement(node) && (node[0] === "img" || hasImage(childrenOf(node))));
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
  const kind = KINDS.get(tag) ?? (/^h[1-6]$/.test(tag) ? "heading" : `::${tag} block`);
  const words = clip(tag === "img" ? text(attrs.alt) : textContent(node));
  return `the ${kind}${words ? ` "${words}"` : ""}`;
}

const isImage = (node: Node | undefined): node is ElementNode =>
  isElement(node) && node[0] === "img";

// The styles center an image that is a direct child of a slide, so only an image that stands alone may be one: an
// image alone in its paragraph leaves it, and an image in a sentence gets back the paragraph Comark drops around a
// slide that is a single paragraph.
function standalone(nodes: Node[]): Node[] {
  const lifted = nodes.map((node) => {
    if (!isElement(node) || node[0] !== "p") return node;
    const content = childrenOf(node).filter(isContent);
    return content.length === 1 && isImage(content[0]) ? content[0] : node;
  });
  const inline =
    lifted.some(isImage) && lifted.some((node) => !Array.isArray(node) && isContent(node));
  return inline ? [["p", {}, ...lifted]] : lifted;
}

interface Walk {
  data: Data;
  issues: string[];
  carousels: number;
  strays: number;
}

function carousel(node: ElementNode, walk: Walk) {
  const attrs = resolveAttributes(node[1], walk.data, { parseJson: true });
  const title = text(attrs.title);
  const name = `carousel ${++walk.carousels}${title ? ` ("${title}")` : ""}`;
  const content = childrenOf(node).filter(isContent);
  const explicit = content.some(isSlide);
  if (explicit)
    for (const child of content.filter((child) => !isSlide(child)))
      walk.issues.push(
        `${name} drops ${describe(child)} because it sits outside every :::slide; move it into a :::slide.`,
      );
  const slides: ElementNode[] = explicit
    ? content.filter(isSlide)
    : content.map((child) => ["slide", {}, child]);
  if (!slides.length)
    walk.issues.push(
      `${name} has no slides; put blocks or :::slide blocks inside it, or remove it.`,
    );
  if (attrs.columns !== undefined && ![1, 2, 3].includes(Number(attrs.columns)))
    walk.issues.push(`${name} has columns=${text(attrs.columns)}; use 1, 2, or 3.`);
  const zoom = attrs.zoom !== false && attrs.zoom !== "false";
  for (const [index, slide] of slides.entries()) {
    slide.splice(2, slide.length - 2, ...standalone(childrenOf(slide)));
    slide[1].index = String(index + 1);
    slide[1].count = String(slides.length);
    if (!zoom) slide[1].zoom = "false";
    // An image names its zoomed view with its alt text; anything else would show an empty header.
    const titled = slide[1].title !== undefined || slide[1][":title"] !== undefined;
    if (title && !titled && !hasImage(childrenOf(slide))) slide[1].title = title;
  }
  node[1].count = String(slides.length);
  node.splice(2, node.length - 2, ...slides);
}

// Every renderer gets explicit slides with their position, so none of them has to split rendered children.
function normalize(nodes: Node[], walk: Walk, inCarousel = false) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "slide" && !inCarousel) {
      const title = text(resolveAttributes(node[1], walk.data, { parseJson: true }).title);
      walk.issues.push(
        `:::slide ${++walk.strays}${title ? ` ("${title}")` : ""} sits outside a ::carousel, so it renders as plain content; wrap it in a ::carousel or remove the :::slide fence.`,
      );
      // A plain div, so no renderer gives it a position or a zoom that belongs to a carousel.
      node[0] = "div";
      node[1] = {};
    }
    if (node[0] === "carousel") carousel(node, walk);
    normalize(childrenOf(node), walk, node[0] === "carousel");
  }
}

/**
 * Turns `::carousel` into slides: every block inside it, or every `:::slide` when there are any. Slides scroll and
 * snap without a script; the script adds arrows, a counter, and keys, and zooms a slide with the others in a strip.
 * Problems, such as content outside every `:::slide`, are added to `meta.issues`.
 */
export default defineComarkPlugin<void, CarouselMeta>(() => ({
  name: "comark-carousel",
  post(state) {
    const { tree } = state;
    const walk: Walk = {
      data: { frontmatter: tree.frontmatter, meta: tree.meta, data: {}, props: {} },
      issues: [],
      carousels: 0,
      strays: 0,
    };
    normalize(tree.nodes, walk);
    tree.meta.issues = [...(tree.meta.issues ?? []), ...walk.issues];
  },
}));

import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import { textContent } from "comark/utils";
import { type Image, inline } from "./images.ts";

export interface ChipsOptions {
  /** Download each image while parsing and inline it, so readers' browsers ask no other site. `false` keeps the URLs. */
  download?: boolean;
  /** The image URL of a site, by its host. Google's favicon service by default. */
  favicon?: (host: string) => string;
  /** The image URL of a GitHub account, for `@user` and for links into it. Its GitHub avatar by default. */
  avatar?: (login: string) => string;
}

export type ChipsMeta = {
  /** One readable sentence per problem with a chip. Other plugins add theirs too. */
  issues: string[];
};

/** The node a chip is. After parsing, its attributes are `href`, `kind` (`avatar` or `favicon`), `src`, and `title`. */
export const CHIP_TAG = "chip";

const LOGIN = "[a-z\\d](?:[a-z\\d]|-(?=[a-z\\d])){0,38}";
// `@user`, not inside a word, a path, or an email address. A name followed by a slash is an npm scope such as
// `@comark/html`, so it isn't a mention.
const MENTION = new RegExp(`(?<![\\w/.@#-])@(${LOGIN})(?![\\w/-])`, "gi");
const ACCOUNT = new RegExp(`^https?://github\\.com/(${LOGIN})(?:[/?#]|$)`, "i");
// Pages at github.com/<name> that aren't an account.
const ROUTES = new Set(
  "about apps collections enterprise explore features issues login marketplace new notifications orgs organizations pricing pulls search settings sponsors topics trending".split(
    " ",
  ),
);
// Text in these is a link, a chip, or code already, so it stays as written.
const SKIP = new Set(["a", CHIP_TAG, "code", "pre", "script", "style"]);
const WEB = /^https?:\/\//i;

const isElement = (node: Node | undefined): node is ElementNode =>
  Array.isArray(node) && node[0] !== null;
const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean).trim();
const childrenOf = ([, , ...rest]: ElementNode): Node[] => rest;
const hasImage = (nodes: Node[]): boolean =>
  nodes.some((node) => isElement(node) && (node[0] === "img" || hasImage(childrenOf(node))));
/** Remove interactive chip descendants before making their parent interactive. */
function flattenChips(nodes: Node[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === CHIP_TAG) node[0] = "span";
    else flattenChips(childrenOf(node));
  }
}

const favicon = (host: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
const githubAvatar = (login: string) => `https://github.com/${login}.png?size=64`;

function mentions(value: string, found: Map<ElementNode, string>): Node[] {
  const nodes: Node[] = [];
  let last = 0;
  for (const match of value.matchAll(MENTION)) {
    const [whole, login = ""] = match;
    if (match.index > last) nodes.push(value.slice(last, match.index));
    const chip: ElementNode = [CHIP_TAG, { href: `https://github.com/${login}` }, login];
    found.set(chip, `\`${whole}\``);
    nodes.push(chip);
    last = match.index + whole.length;
  }
  if (!last) return [value];
  if (last < value.length) nodes.push(value.slice(last));
  return nodes;
}

// A link's own text is kept, with two exceptions: a bare URL loses its scheme, and a mention its `@`, since the image
// says where it goes.
function label(node: ElementNode, href: string) {
  const shown = textContent(node).trim();
  if (shown === href) node.splice(2, node.length - 2, href.replace(WEB, "").replace(/\/$/, ""));
  const login = ACCOUNT.exec(href)?.[1];
  if (login && shown.toLowerCase() === `@${login.toLowerCase()}`)
    node.splice(2, node.length - 2, shown.slice(1));
}

function collect(nodes: Node[], start: number, found: Map<ElementNode, string>) {
  for (let index = nodes.length - 1; index >= start; index--) {
    const node = nodes[index];
    if (!Array.isArray(node)) {
      nodes.splice(index, 1, ...mentions(node, found));
      continue;
    }
    if (!isElement(node)) continue;
    const [tag, attrs] = node;
    if (attrs.$?.html) continue;
    const href = text(attrs.href);
    if (tag === "a" && WEB.test(href)) {
      if (text(attrs.chip) === "false") delete attrs.chip;
      else if (!hasImage(childrenOf(node))) {
        try {
          new URL(href);
        } catch {
          found.set(node, `[${textContent(node).trim()}](${href})`);
          continue;
        }
        flattenChips(childrenOf(node));
        node[0] = CHIP_TAG;
        label(node, href);
        found.set(node, `[${textContent(node).trim()}](${href})`);
      }
      continue;
    }
    if (tag === CHIP_TAG) {
      found.set(node, `\`:chip\` [${textContent(node).trim()}](${href})`);
      continue;
    }
    if (SKIP.has(tag)) continue;
    // SAFETY: an element node is [tag, attributes, ...children], so its children start at index 2.
    collect(node as Node[], 2, found);
  }
}

/**
 * Turns every web link into a chip with the site's favicon, and every `@user` into a chip with their GitHub avatar.
 * A link into a GitHub account shows its avatar too. `{avatar="https://…"}` or `{avatar="@user"}` on a link sets the
 * image, and `{chip=false}` keeps a plain link. Images are downloaded while parsing and inlined; one that can't be
 * downloaded is left for the reader's browser to load.
 */
export default defineComarkPlugin<ChipsOptions | undefined, ChipsMeta>((options) => {
  const siteImage = options?.favicon ?? favicon;
  const accountImage = options?.avatar ?? githubAvatar;
  return {
    name: "comark-chips",
    async post(state) {
      const { tree } = state;
      const found = new Map<ElementNode, string>();
      collect(tree.nodes, 0, found);
      if (!found.size) return;
      const issues: string[] = [];
      const chips = [...found].flatMap(([node, where]) => {
        const href = text(node[1].href);
        if (!WEB.test(href)) {
          issues.push(
            `${where}: \`href\` must be a web address, such as \`href="https://vite.dev"\`.`,
          );
          return [];
        }
        const custom = text(node[1].avatar);
        const named = custom.startsWith("@") ? custom.slice(1) : undefined;
        const linked = custom ? undefined : ACCOUNT.exec(href)?.[1];
        const account = named ?? (linked && !ROUTES.has(linked.toLowerCase()) ? linked : undefined);
        let host: string;
        try {
          host = new URL(href).host;
        } catch {
          issues.push(`${where}: \`href\` must be a valid web address.`);
          return [];
        }
        const image = account ? accountImage(account) : custom || siteImage(host);
        const kind = custom || account ? "avatar" : "favicon";
        return [{ node, where, href, image, kind, custom: Boolean(custom) }];
      });
      const images: Map<string, Image> =
        options?.download === false
          ? new Map(chips.map(({ image }) => [image, { src: image }]))
          : await inline(chips.map(({ image }) => image));
      for (const { node, where, href, image, kind, custom } of chips) {
        const result = images.get(image) ?? { src: image };
        if ("status" in result && kind === "avatar")
          issues.push(
            custom
              ? `${where}: its \`avatar\` image answered HTTP ${result.status}. Fix the URL, or remove \`avatar\`.`
              : `${where}: there's no avatar at ${image} (HTTP ${result.status}). Check the GitHub login, or set \`avatar\` to an image URL.`,
          );
        const title = text(node[1].title);
        node[1] = {
          href,
          kind,
          ...("src" in result && { src: result.src }),
          ...(title && { title }),
        };
      }
      tree.meta.issues = [...(tree.meta.issues ?? []), ...issues];
    },
  };
});

import type { ElementNode, Node } from "comark";
import { resolveAttributes } from "comark/render";
import { textContent } from "comark/utils";
import { type Mark, marks } from "./marks.ts";

export interface Annotation {
  /** Links the mark to its note; unique within a screenshot or compare. */
  n: number;
  /** The number shown on the stamp. Side notes have none: their arrow links them. */
  number?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  mark: Mark;
  color?: string;
  /** Pull the note out beside or above the image, joined to the mark by an arrow. */
  side?: "left" | "right" | "top";
  note: Node[];
}

export interface Screenshot {
  src: string;
  alt: string;
  title?: string;
  href?: string;
  annotations: Annotation[];
  caption: Node[];
}

export interface Compare {
  title?: string;
  shots: Screenshot[];
}

/** What `:bound` props resolve against: the renderer's `state.renderData`, or the parsed document. */
export type Data = Parameters<typeof resolveAttributes>[1];

/** Named colors, each with one meaning. Anything else must be a hex color. */
export const PALETTE = ["red", "amber", "green", "blue", "gray"] as const;

// What `check` calls each screenshot and compare in its messages. The renderer reports nothing, so it needs no names.
type Names = Map<ElementNode, string>;

// Comark text nodes are strings, elements are arrays, and comments are arrays with a null tag.
const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const children = ([, , ...rest]: ElementNode): Node[] => rest;
// Prop values arrive as strings, numbers, or booleans; objects and arrays aren't valid for any prop here.
const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean).trim();
// Inline, YAML-block, and `:bound` props all land here, parsed the way Comark's own renderers see them.
const props = (node: ElementNode, data: Data) =>
  resolveAttributes(node[1], data, { parseJson: true });
// A `:bound` prop that resolved to nothing. The required-prop checks skip it, and `checkProps` reports it unless it
// reads render-time data.
const unresolved = (node: ElementNode, attrs: Record<string, unknown>, key: string) =>
  attrs[key] === undefined && Object.hasOwn(node[1], `:${key}`);
// Only the renderer's `data` and the parent's `props` are unknown while parsing; frontmatter and meta are already here.
const later = (path: string) => /^(?:data|props)(?:\.|$)/.test(path);
// A link the reader can follow: http or https with a host, which the prefix alone doesn't promise.
function isHttp(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === "http:" || protocol === "https:") && hostname !== "";
  } catch {
    return false;
  }
}
// Quotes what an author wrote, so a quote inside it can't blur where the name ends.
const quote = (value: string) => JSON.stringify(value);
const named = new Set<string>(PALETTE);
// Alpha hex colors are left out: a transparent one would hide the mark.
const isColor = (color: string) => named.has(color) || /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color);
const isMark = (mark: string): mark is Mark => Object.hasOwn(marks, mark);
// Comments render nothing, so they don't count as a note; an image does.
const hasContent = (nodes: Node[]): boolean =>
  nodes.some((node) =>
    !Array.isArray(node)
      ? node.trim() !== ""
      : isElement(node) && (node[0] === "img" || hasContent(children(node))),
  );
// Allow half a percent of rounding error when an agent converts pixels to percentages.
const EDGE = 100.5;
const SIDES = ["left", "right", "top"] as const;
// Notes on one side closer than this would likely overlap: % of the image height for left and right, of its
// width for top. A heuristic, since the text itself can't be measured.
const SIDE_GAP = { left: 12, right: 12, top: 25 };
// styles.ts links marks and notes for this many annotations per screenshot or compare.
export const MAX_LINKED = 40;

const PROPS = {
  screenshot: ["src", "alt", "title", "href", "viewport"],
  compare: ["title"],
  annotation: ["x", "y", "w", "h", "mark", "color", "side"],
} as const;
type Block = keyof typeof PROPS;
// Comark's own attributes, which a host may style or test by, so they aren't reported.
const NATIVE = /^(?:id|class|style|data-.+|aria-.+)$/i;
// Names an author is likely to guess, and what to write instead.
const HINTS: Record<Block, Record<string, string>> = {
  screenshot: {
    label: "Did you mean `title`?",
    url: "Did you mean `href`?",
    caption: "Write the caption as Markdown inside the block, after the annotations.",
    width: "The image keeps its own size; set `viewport` to record the capture size.",
    height: "The image keeps its own size; set `viewport` to record the capture size.",
  },
  compare: {
    label: "Did you mean `title`?",
    viewport: "Set `viewport` on each screenshot instead.",
  },
  annotation: {
    width: "Did you mean `w`?",
    height: "Did you mean `h`?",
    colour: "Did you mean `color`?",
    left: "Did you mean `x`?",
    top: "Did you mean `y`?",
    label: "Write the note as the block's content.",
    title: "Write the note as the block's content.",
    note: "Write the note as the block's content.",
    text: "Write the note as the block's content.",
  },
};

function distance(a: string, b: string) {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        row[j]! + 1,
        next[j - 1]! + 1,
        row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[b.length]!;
}

// Unknown props are dropped, and broken bindings would render at 0 or empty, so both are reported.
function checkProps(
  block: Block,
  node: ElementNode,
  attrs: Record<string, unknown>,
  problems: string[],
  data: Data,
) {
  const valid: readonly string[] = PROPS[block];
  // The raw keys, since resolving drops some: a bound `__proto__` would set the result's prototype instead.
  const keys = new Set(Object.keys(node[1]).map((key) => key.replace(/^:/, "")));
  keys.delete("$");
  for (const key of keys) {
    if (NATIVE.test(key)) continue;
    if (valid.includes(key)) {
      // Comark drops a bound `src` or `href` that resolves to an unsafe URL, such as javascript:. The binding is
      // resolved alone, since a plain value next to it would still fill `attrs`.
      const bound = `:${key}`;
      if (
        Object.hasOwn(node[1], bound) &&
        !Object.hasOwn(props([node[0], { [bound]: node[1][bound] }], data), key)
      ) {
        problems.push(
          `\`:${key}\` resolves to an unsafe URL, so it's left out. Use an http:// or https:// URL${key === "src" ? " or a path to the image file" : ""}.`,
        );
        continue;
      }
      const path = text(node[1][`:${key}`]);
      if (unresolved(node, attrs, key) && !later(path))
        problems.push(
          `\`:${key}\` points at ${path}, which is undefined. Fix the path or set \`${key}\` directly.`,
        );
      continue;
    }
    const lower = key.toLowerCase();
    const close = valid.find(
      (name) => lower.length >= 3 && distance(lower, name) <= (lower.length >= 5 ? 2 : 1),
    );
    const hints = HINTS[block];
    const hint = Object.hasOwn(hints, lower)
      ? hints[lower]
      : close
        ? `Did you mean \`${close}\`?`
        : "";
    problems.push(
      `\`${key}\` isn't a prop of \`::${block}\`.${hint ? ` ${hint}` : ""} Valid props: ${valid.join(", ")}.`,
    );
  }
}

const VIEWPORT = /^(\d+)\s*[x×]\s*(\d+)$/i;

/** Reads a `::screenshot` node, counting on from `start`. Problems go to `issues`; rendering never throws. */
export function readScreenshot(
  node: ElementNode,
  issues: string[],
  data: Data,
  names: Names = new Map(),
  start = { n: 1, number: 1 },
): Screenshot & { viewport?: { width: number; height: number } } {
  let number = start.number;
  const where = names.get(node) ?? "screenshot";
  const problems: string[] = [];
  const attrs = props(node, data);
  checkProps("screenshot", node, attrs, problems, data);
  const src = text(attrs.src);
  if (!src && !unresolved(node, attrs, "src"))
    problems.push("`src` is required. Point it at the image file.");
  const alt = text(attrs.alt);
  if (!alt && !unresolved(node, attrs, "alt"))
    problems.push("`alt` is required. Describe what the screenshot shows.");
  const href = text(attrs.href);
  if (href && !isHttp(href))
    problems.push(
      "`href` must be an http:// or https:// URL with a host. Link the page you captured.",
    );
  const viewport = text(attrs.viewport);
  const size = VIEWPORT.exec(viewport);
  if (viewport && !size)
    problems.push(
      `\`viewport\` must be the capture size in pixels, like 1440x900 (got ${quote(viewport)}).`,
    );
  issues.push(...problems.map((problem) => `${where}: ${problem}`));

  const annotations: Annotation[] = [];
  const caption: Node[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "annotation") {
      const n = start.n + annotations.length;
      const found: string[] = [];
      const annotation = readAnnotation(child, found, data);
      const stamp = annotation.side ? undefined : number++;
      const index = annotations.length + 1;
      const label = `${where}, annotation ${index}${annotation.side ? ` (${annotation.side} note)` : stamp === index ? "" : ` (stamp ${stamp})`}`;
      issues.push(...found.map((problem) => `${label}: ${problem}`));
      if (n === MAX_LINKED + 1)
        issues.push(
          `${where}: more than ${MAX_LINKED} annotations in one screenshot or compare. Hovering stops linking marks to notes after ${MAX_LINKED}; split it into several screenshots.`,
        );
      annotations.push({ ...annotation, n, number: stamp });
    } else caption.push(child);
  }
  const nestedProblems: string[] = [];
  nested(caption, nestedProblems);
  issues.push(...nestedProblems.map((problem) => `${where}: ${problem}`));
  for (const side of SIDES) {
    const centers = annotations
      .flatMap((annotation, index) =>
        annotation.side === side
          ? [
              {
                index: index + 1,
                at:
                  side === "top"
                    ? annotation.x + annotation.w / 2
                    : annotation.y + annotation.h / 2,
              },
            ]
          : [],
      )
      .sort((a, b) => a.at - b.at);
    for (let i = 1; i < centers.length; i++)
      if (centers[i]!.at - centers[i - 1]!.at < SIDE_GAP[side])
        issues.push(
          `${where}: the ${side} notes for annotations ${centers[i - 1]!.index} and ${centers[i]!.index} would overlap. Move one to the other side or leave it under the image.`,
        );
  }
  return {
    src,
    alt,
    title: text(attrs.title) || undefined,
    href: isHttp(href) ? href : undefined,
    viewport: size ? { width: Number(size[1]), height: Number(size[2]) } : undefined,
    annotations,
    caption,
  };
}

function readAnnotation(node: ElementNode, problems: string[], data: Data): Omit<Annotation, "n"> {
  const attrs = props(node, data);
  checkProps("annotation", node, attrs, problems, data);
  const box = { x: 0, y: 0, w: 0, h: 0 };
  let known = true;
  for (const key of ["x", "y", "w", "h"] as const) {
    if (unresolved(node, attrs, key)) {
      known = false;
      continue;
    }
    const raw = text(attrs[key]);
    const value = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) ? Number(raw) : Number.NaN;
    const range = key === "x" || key === "y" ? "from 0 to 100" : "above 0 and up to 100";
    const valid = key === "x" || key === "y" ? value <= 100 : value > 0 && value <= 100;
    if (!raw) {
      known = false;
      problems.push(
        `\`${key}\` is required: a percentage of the image, a number without %, ${range}.`,
      );
    } else if (!valid) {
      known = false;
      problems.push(
        `\`${key}\` must be a percentage of the image, a number without %, ${range} (got ${quote(raw)}).`,
      );
    } else box[key] = value;
  }
  if (known && (box.x + box.w > EDGE || box.y + box.h > EDGE))
    problems.push("the box runs past the image edge. Keep x + w and y + h within 100.");

  const mark = text(attrs.mark) || "box";
  if (!isMark(mark))
    problems.push(`\`mark\` must be one of ${Object.keys(marks).join(", ")} (got ${quote(mark)}).`);
  const color = text(attrs.color);
  if (color && !isColor(color))
    problems.push(
      `\`color\` must be ${PALETTE.join(", ")}, or a 3- or 6-digit hex color like #e5484d (got ${quote(color)}).`,
    );
  const side = text(attrs.side);
  const knownSide = SIDES.find((item) => item === side);
  if (side && !knownSide)
    problems.push(`\`side\` must be left, right, or top (got ${quote(side)}).`);
  if (mark === "none" && !side && !unresolved(node, attrs, "side"))
    problems.push(
      '`mark="none"` draws nothing, so without a `side` note nothing points at the spot. Add `side="left"`, `"right"`, or `"top"`, or pick a visible mark such as `box`.',
    );
  const note = children(node);
  if (!hasContent(note)) problems.push("write a note explaining what the mark points at.");
  nested(note, problems);

  return {
    ...box,
    mark: isMark(mark) ? mark : "box",
    color: isColor(color) ? color : undefined,
    side: knownSide,
    note,
  };
}

// Screenshots, compares, and annotations only work as direct children; deeper ones would be dropped or unchecked.
function nested(nodes: Node[], problems: string[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "screenshot" || node[0] === "compare" || node[0] === "annotation")
      problems.push(
        `\`${node[0]}\` can't go inside a note or caption.${node[0] === "annotation" ? " Annotations must be direct children of a screenshot." : " Move it out after the block."}`,
      );
    else nested(children(node), problems);
  }
}

/** Reads a `::compare` node: two screenshots numbered as one sequence, titled Before and After unless they say otherwise. */
export function readCompare(
  node: ElementNode,
  issues: string[],
  data: Data,
  names: Names = new Map(),
): Compare {
  const where = names.get(node) ?? "compare";
  const attrs = props(node, data);
  const problems: string[] = [];
  checkProps("compare", node, attrs, problems, data);
  issues.push(...problems.map((problem) => `${where}: ${problem}`));
  const shots: Screenshot[] = [];
  const viewports: { name: string; size?: { width: number; height: number } }[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "screenshot") {
      const all = shots.flatMap((item) => item.annotations);
      const { viewport, ...shot } = readScreenshot(child, issues, data, names, {
        n: 1 + all.length,
        number: 1 + all.filter((annotation) => annotation.number).length,
      });
      shots.push({ ...shot, title: shot.title ?? (shots.length ? "After" : "Before") });
      viewports.push({ name: names.get(child) ?? "screenshot", size: viewport });
    } else if (isElement(child) || text(child))
      issues.push(
        `${where}: only \`screenshot\` blocks can go inside a compare (found ${isElement(child) && child[0] !== "p" ? `\`${child[0]}\`` : "text"}). Move it before or after the compare.`,
      );
  }
  if (shots.length !== 2)
    issues.push(
      `${where}: needs exactly two screenshots, before and after (got ${shots.length}). ${shots.length < 2 ? "Add the missing one" : "Split the rest into another compare"}.`,
    );
  const [before, after] = viewports;
  const px = (size: { width: number; height: number }) => `${size.width}x${size.height}`;
  if (
    before?.size &&
    after?.size &&
    (before.size.width !== after.size.width || before.size.height !== after.size.height)
  )
    issues.push(
      `${where}: ${before.name} was captured at ${px(before.size)} and ${after.name} at ${px(after.size)}, so they can't be compared. Recapture both at the same viewport.`,
    );
  return { title: text(attrs.title) || undefined, shots };
}

// Every screenshot is named by its src when no other screenshot shares it, and otherwise by its position and alt.
function name(nodes: Node[], data: Data): Names {
  const shots: ElementNode[] = [];
  const compares: ElementNode[] = [];
  const walk = (list: Node[]) => {
    for (const node of list) {
      if (!isElement(node)) continue;
      if (node[0] === "screenshot") shots.push(node);
      else {
        if (node[0] === "compare") compares.push(node);
        if (node[0] !== "annotation") walk(children(node));
      }
    }
  };
  walk(nodes);
  const names: Names = new Map();
  const srcs = shots.map((node) => text(props(node, data).src));
  for (const [index, node] of shots.entries()) {
    const src = srcs[index]!;
    const alt = text(props(node, data).alt);
    names.set(
      node,
      src && srcs.indexOf(src) === srcs.lastIndexOf(src)
        ? `screenshot ${quote(src)}`
        : `screenshot ${index + 1}${alt ? ` (${quote(alt)})` : ""}`,
    );
  }
  for (const [index, node] of compares.entries()) {
    const title = text(props(node, data).title);
    names.set(node, `compare ${index + 1}${title ? ` (${quote(title)})` : ""}`);
  }
  return names;
}

/** Every problem in a document's screenshots, compares, and annotations. */
export function check(nodes: Node[], data: Data): string[] {
  const issues: string[] = [];
  const names = name(nodes, data);
  let stray = 0;
  const walk = (list: Node[]) => {
    for (const node of list) {
      if (!isElement(node)) continue;
      if (node[0] === "compare") readCompare(node, issues, data, names);
      else if (node[0] === "screenshot") readScreenshot(node, issues, data, names);
      else if (node[0] === "annotation") {
        const note = textContent(["div", {}, ...children(node)])
          .trim()
          .slice(0, 40);
        issues.push(
          `annotation ${++stray} outside a screenshot${note ? ` (${quote(note)})` : ""}: it has nothing to point at. Move it inside the \`::screenshot\` it marks, as a direct child.`,
        );
      } else walk(children(node));
    }
  };
  walk(nodes);
  return issues;
}

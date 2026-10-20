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

/** How a compare shows its pair: side by side, or laid over each other with a divider the reader drags. */
export const MODES = ["columns", "slider"] as const;
export type Mode = (typeof MODES)[number];

export interface Compare {
  title?: string;
  mode: Mode;
  shots: Screenshot[];
}

export interface DiffRow {
  kind: "same" | "del" | "add";
  /** Line numbers in the file before and after, when the diff sets `line`. */
  old?: number;
  new?: number;
  /** The line's content: Shiki's token spans when the code is highlighted, with changed words in `del` or `ins`. */
  nodes: Node[];
}

export interface Diff {
  file: string;
  label?: string;
  line?: number;
  rows: DiffRow[];
  /** The first code block's `class` and `style`, which carry Shiki's theme. */
  code: { class?: string; style?: string };
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
type Side = (typeof SIDES)[number];
// Notes on one side closer than this would likely overlap: % of the image height for left and right, of its
// width for top. A heuristic, since the text itself can't be measured.
const SIDE_GAP = { left: 12, right: 12, top: 25 };
// styles.ts links marks and notes for this many annotations per screenshot or compare.
export const MAX_LINKED = 40;

const PROPS = {
  screenshot: ["src", "alt", "title", "href", "viewport"],
  compare: ["title", "mode"],
  annotation: ["x", "y", "w", "h", "mark", "color", "side"],
  diff: ["file", "line", "label"],
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
  diff: {
    title: "Did you mean `label`?",
    filename: "Did you mean `file`?",
    start: "Did you mean `line`?",
    lang: "Set the language on both code blocks, like ```ts.",
    language: "Set the language on both code blocks, like ```ts.",
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
  start: { n: number; number: number; sides?: readonly Side[] } = { n: 1, number: 1 },
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
      if (annotation.side && !(start.sides ?? SIDES).includes(annotation.side))
        annotation.side = undefined;
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

// Screenshots, compares, diffs, and annotations only work as direct children; deeper ones would be dropped or unchecked.
const BLOCKS = new Set(["screenshot", "compare", "diff", "annotation"]);
function nested(nodes: Node[], problems: string[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (BLOCKS.has(node[0]))
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
  const mode = text(attrs.mode) || "columns";
  const known = MODES.find((item) => item === mode);
  // A note beside one screenshot of a pair would sit against the other one and narrow its own image, and in a slider
  // its arrow would cross the divider. Those notes join the numbered list; a note above stays in its own column.
  const sides = known === "slider" ? [] : (["top"] as const);
  const shots: Screenshot[] = [];
  const viewports: { name: string; size?: { width: number; height: number } }[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "screenshot") {
      const all = shots.flatMap((item) => item.annotations);
      const { viewport, ...shot } = readScreenshot(child, issues, data, names, {
        n: 1 + all.length,
        number: 1 + all.filter((annotation) => annotation.number).length,
        sides,
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
  if (!known)
    issues.push(
      `${where}: \`mode\` is ${quote(mode)}, which isn't a compare mode. Use \`columns\` (side by side, the default) or \`slider\`.`,
    );
  return { title: text(attrs.title) || undefined, mode: known ?? "columns", shots };
}

// A suggested change is a few lines around the edit; past this it stops being reviewable.
export const MAX_DIFF_LINES = 200;
// Above this many cells the line diff would hold too much memory, so every line counts as changed.
const MAX_CELLS = 4_000_000;

type Step = ["same", number, number] | ["del", number] | ["add", number];

// The longest common subsequence of two lists, as the steps that turn `a` into `b`; a run of changes lists its
// removals before its additions.
function lcs(a: readonly string[], b: readonly string[]): Step[] {
  if (a.length * b.length > MAX_CELLS)
    return [...a.map((_, i): Step => ["del", i]), ...b.map((_, j): Step => ["add", j])];
  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1]! + 1
          : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
  const steps: Step[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) steps.push(["same", i++, j++]);
    else if (
      j >= b.length ||
      (i < a.length && table[(i + 1) * width + j]! >= table[i * width + j + 1]!)
    )
      steps.push(["del", i++]);
    else steps.push(["add", j++]);
  }
  return steps;
}

const lineText = (nodes: Node[]) => textContent(["span", {}, ...nodes]);

// Shiki wraps each line in a `span.line` and puts a newline between them; plain code is one string. Both come out as
// one list of nodes per line.
function lines(pre: ElementNode): Node[][] {
  const code = children(pre).find(isElement);
  const result: Node[][] = [[]];
  const add = (nodes: Node[]) => {
    for (const node of nodes) {
      if (!Array.isArray(node)) {
        const [first, ...rest] = node.split("\n");
        if (first) result.at(-1)!.push(first);
        for (const part of rest) result.push(part ? [part] : []);
      } else if (
        isElement(node) &&
        node[0] === "span" &&
        /(?:^|\s)line(?:\s|$)/.test(text(node[1].class))
      )
        add(children(node));
      else if (isElement(node)) result.at(-1)!.push(node);
    }
  };
  add(code && code[0] === "code" ? children(code) : children(pre));
  // An empty fence still parses as one empty line.
  return result.length === 1 && !lineText(result[0]!) ? [] : result;
}

// Words, runs of spaces, and single symbols, so a changed name is marked whole and a changed bracket alone.
const words = (line: string) => line.match(/\w+|\s+|[^\w\s]/g) ?? [];

// The character ranges of a line that the other line doesn't share, joined across the spaces between them.
function changed(steps: Step[], tokens: string[], side: "del" | "add") {
  const ranges: [number, number][] = [];
  let at = 0;
  // Whether only spaces lie between `at` and the end of the last range.
  let joined = false;
  for (const step of steps) {
    if (step[0] !== "same" && step[0] !== side) continue;
    const token = tokens[step[0] === "same" && side === "add" ? step[2] : step[1]]!;
    if (step[0] === side) {
      const last = ranges.at(-1);
      if (last && joined) last[1] = at + token.length;
      else ranges.push([at, at + token.length]);
      joined = true;
    } else joined &&= !token.trim();
    at += token.length;
  }
  return ranges;
}

// Cuts the line's nodes at the ranges and wraps what falls inside in `tag`, inside Shiki's token spans so the colors stay.
function cut(nodes: Node[], ranges: [number, number][], tag: "del" | "ins", start = 0): Node[] {
  const result: Node[] = [];
  let at = start;
  for (const node of nodes) {
    const length = !Array.isArray(node)
      ? node.length
      : isElement(node)
        ? lineText([node]).length
        : 0;
    const inside = ranges.filter(([from, to]) => from < at + length && to > at);
    if (!inside.length) result.push(node);
    else if (!Array.isArray(node)) {
      let cursor = 0;
      for (const [from, to] of inside) {
        const a = Math.max(from - at, 0);
        const b = Math.min(to - at, length);
        if (a > cursor) result.push(node.slice(cursor, a));
        result.push([tag, {}, node.slice(a, b)]);
        cursor = b;
      }
      if (cursor < length) result.push(node.slice(cursor));
    } else if (isElement(node))
      result.push([node[0], node[1], ...cut(children(node), ranges, tag, at)]);
    else result.push(node);
    at += length;
  }
  return result;
}

// Marks the words that changed between a removed line and the added line paired with it, unless they share too
// little for the marks to help: then the whole line is the change.
function pair(before: DiffRow, after: DiffRow) {
  const a = words(lineText(before.nodes));
  const b = words(lineText(after.nodes));
  const steps = lcs(a, b);
  let shared = 0;
  for (const step of steps) if (step[0] === "same") shared += a[step[1]]!.length;
  const total = a.join("").length + b.join("").length;
  if (!total || (2 * shared) / total < 0.5) return;
  const removed = changed(steps, a, "del");
  const added = changed(steps, b, "add");
  if (removed.length) before.nodes = cut(before.nodes, removed, "del");
  if (added.length) after.nodes = cut(after.nodes, added, "ins");
}

const codeBlocks = (node: ElementNode) =>
  children(node).filter((child): child is ElementNode => isElement(child) && child[0] === "pre");
// The `file` prop wins over the blocks' own names, and the first block's over the second's.
const fileOf = (node: ElementNode, attrs: Record<string, unknown>) =>
  text(attrs.file) || text(codeBlocks(node)[0]?.[1].filename) || "";

/** Reads a `::diff` node: two fenced code blocks, before and after, as the rows of a suggested change. */
export function readDiff(
  node: ElementNode,
  issues: string[],
  data: Data,
  names: Names = new Map(),
): Diff {
  const attrs = props(node, data);
  const blocks = codeBlocks(node);
  const [first, second] = blocks;
  const filenames = [text(first?.[1].filename), text(second?.[1].filename)];
  const file = fileOf(node, attrs);
  const where = names.get(node) ?? (file ? `diff ${quote(file)}` : "diff");
  const problems: string[] = [];
  checkProps("diff", node, attrs, problems, data);
  for (const child of children(node))
    if (!(isElement(child) && child[0] === "pre") && (isElement(child) || text(child)))
      problems.push(
        `only two code blocks can go inside a diff (found ${isElement(child) && child[0] !== "p" ? `\`${child[0]}\`` : "text"}). Put explanations above or below it.`,
      );
  if (blocks.length !== 2)
    problems.push(
      `needs exactly two code blocks, before and after (got ${blocks.length}). ${blocks.length < 2 ? "Add the missing one; leave it empty for a file that's added or deleted" : "Put the rest in another diff"}.`,
    );
  const language = (block?: ElementNode) => text(block?.[1].language);
  if (first && !file && !unresolved(node, attrs, "file"))
    problems.push(
      `name the file in the first block (\`\`\`${language(first) || "ts"} [src/a.ts]) or with file="src/a.ts".`,
    );
  if (filenames[0] && filenames[1] && filenames[0] !== filenames[1])
    problems.push(
      `the before block names ${quote(filenames[0])} and the after block ${quote(filenames[1])}. A diff shows one file; split the other into its own diff.`,
    );
  if (first && second && language(first) !== language(second)) {
    const is = (block: ElementNode) =>
      language(block) ? `is ${quote(language(block))}` : "has no language";
    problems.push(
      `the before block ${is(first)} and the after block ${is(second)}. Give both the same language, like \`\`\`${language(first) || language(second)}.`,
    );
  }
  const raw = text(attrs.line);
  const line = /^\d+$/.test(raw) && Number(raw) >= 1 ? Number(raw) : undefined;
  if (raw && !line)
    problems.push(
      `\`line\` must be the file's line number for the first line, a whole number from 1 (got ${quote(raw)}).`,
    );

  const old = first ? lines(first) : [];
  const next = second ? lines(second) : [];
  for (const [index, list] of [old, next].entries())
    if (list.length > MAX_DIFF_LINES)
      problems.push(
        `the ${index ? "after" : "before"} block has ${list.length} lines. Keep only the lines around the change, at most ${MAX_DIFF_LINES}.`,
      );
  const steps = lcs(old.map(lineText), next.map(lineText));
  if (blocks.length === 2 && steps.every((step) => step[0] === "same"))
    problems.push(
      "before and after are the same, so there's no change to show. Edit the after block, or remove the diff.",
    );
  issues.push(...problems.map((problem) => `${where}: ${problem}`));

  const rows: DiffRow[] = [];
  const at = (n: number) => (line === undefined ? undefined : line + n);
  let removed: DiffRow[] = [];
  let added: DiffRow[] = [];
  const flush = () => {
    for (let k = 0; k < Math.min(removed.length, added.length); k++) pair(removed[k]!, added[k]!);
    rows.push(...removed, ...added);
    removed = [];
    added = [];
  };
  for (const step of steps) {
    if (step[0] === "del") removed.push({ kind: "del", old: at(step[1]), nodes: old[step[1]]! });
    else if (step[0] === "add")
      added.push({ kind: "add", new: at(step[1]), nodes: next[step[1]]! });
    else {
      flush();
      rows.push({ kind: "same", old: at(step[1]), new: at(step[2]), nodes: old[step[1]]! });
    }
  }
  flush();
  const code = first?.[1] ?? {};
  return {
    file,
    label: text(attrs.label) || undefined,
    line,
    rows,
    code: { class: text(code.class) || undefined, style: text(code.style) || undefined },
  };
}

// Every screenshot is named by its src when no other screenshot shares it, and otherwise by its position and alt.
function name(nodes: Node[], data: Data): Names {
  const shots: ElementNode[] = [];
  const compares: ElementNode[] = [];
  const diffs: ElementNode[] = [];
  const walk = (list: Node[]) => {
    for (const node of list) {
      if (!isElement(node)) continue;
      if (node[0] === "screenshot") shots.push(node);
      else {
        if (node[0] === "compare") compares.push(node);
        if (node[0] === "diff") diffs.push(node);
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
  // A diff is named by its file, the way a review names a suggestion, and by its position when that's not enough.
  const files = diffs.map((node) => fileOf(node, props(node, data)));
  for (const [index, node] of diffs.entries()) {
    const file = files[index]!;
    names.set(
      node,
      file && files.indexOf(file) === files.lastIndexOf(file)
        ? `diff ${quote(file)}`
        : diffs.length === 1
          ? "diff"
          : `diff ${index + 1}${file ? ` (${quote(file)})` : ""}`,
    );
  }
  return names;
}

/** Every problem in a document's screenshots, compares, diffs, and annotations. */
export function check(nodes: Node[], data: Data): string[] {
  const issues: string[] = [];
  const names = name(nodes, data);
  let stray = 0;
  const walk = (list: Node[]) => {
    for (const node of list) {
      if (!isElement(node)) continue;
      if (node[0] === "compare") readCompare(node, issues, data, names);
      else if (node[0] === "screenshot") readScreenshot(node, issues, data, names);
      else if (node[0] === "diff") readDiff(node, issues, data, names);
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

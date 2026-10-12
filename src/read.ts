import type { ElementNode, Node } from "comark";
import { resolveAttributes } from "comark/render";
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
  /** Pull the note out beside the image, joined to the mark by an arrow. */
  side?: "left" | "right";
  note: Node[];
}

export interface Screenshot {
  src: string;
  alt: string;
  label?: string;
  url?: string;
  annotations: Annotation[];
  caption: Node[];
}

/** What `:bound` props resolve against: the renderer's `state.renderData`, or the parsed document. */
export type Data = Parameters<typeof resolveAttributes>[1];

/** Named colors, each with one meaning. Anything else must be a hex color. */
export const PALETTE = ["red", "amber", "green", "blue", "gray"] as const;

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
// A `:bound` prop that can't resolve yet, such as one reading render-time `data`, is left to the renderer.
const unresolved = (node: ElementNode, attrs: Record<string, unknown>, key: string) =>
  attrs[key] === undefined && Object.hasOwn(node[1], `:${key}`);
const isHttp = (url: string) => /^https?:\/\/\S/i.test(url);
const named = new Set<string>(PALETTE);
const isColor = (color: string) =>
  named.has(color) || /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color);
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
const SIDES = ["left", "right"] as const;
// Side notes closer than this (in % of the image height) would overlap.
const SIDE_GAP = 12;
// styles.ts links marks and notes for this many annotations per screenshot or compare.
export const MAX_LINKED = 40;

/** Reads a `::screenshot` node, counting on from `start`. Problems go to `issues`; rendering never throws. */
export function readScreenshot(
  node: ElementNode,
  issues: string[],
  data: Data,
  start = { n: 1, number: 1 },
): Screenshot {
  let number = start.number;
  const attrs = props(node, data);
  const src = text(attrs.src);
  const where = `screenshot "${src || "?"}"`;
  if (!src && !unresolved(node, attrs, "src")) issues.push(`${where}: \`src\` is required.`);
  const alt = text(attrs.alt);
  if (!alt && !unresolved(node, attrs, "alt"))
    issues.push(`${where}: \`alt\` is required. Describe what the screenshot shows.`);
  const url = text(attrs.url);
  if (url && !isHttp(url)) issues.push(`${where}: \`url\` must start with http:// or https://.`);

  const annotations: Annotation[] = [];
  const caption: Node[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "annotation") {
      const n = start.n + annotations.length;
      const annotation = readAnnotation(child, `${where}, annotation ${n}`, issues, data);
      if (n === MAX_LINKED + 1)
        issues.push(
          `${where}: more than ${MAX_LINKED} annotations in one screenshot or compare. Hovering stops linking marks to notes after ${MAX_LINKED}; split it into several screenshots.`,
        );
      annotations.push({ ...annotation, n, number: annotation.side ? undefined : number++ });
    } else caption.push(child);
  }
  nested(caption, where, issues);
  for (const side of SIDES) {
    const centers = annotations
      .flatMap((annotation) =>
        annotation.side === side ? [{ n: annotation.n, y: annotation.y + annotation.h / 2 }] : [],
      )
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < centers.length; i++)
      if (centers[i]!.y - centers[i - 1]!.y < SIDE_GAP)
        issues.push(
          `${where}: the ${side} notes for annotations ${centers[i - 1]!.n} and ${centers[i]!.n} would overlap. Move one to the other side or leave it under the image.`,
        );
  }
  return {
    src,
    alt,
    label: text(attrs.label) || undefined,
    url: isHttp(url) ? url : undefined,
    annotations,
    caption,
  };
}

function readAnnotation(
  node: ElementNode,
  where: string,
  issues: string[],
  data: Data,
): Omit<Annotation, "n"> {
  const attrs = props(node, data);
  const box = { x: 0, y: 0, w: 0, h: 0 };
  let known = true;
  for (const key of ["x", "y", "w", "h"] as const) {
    if (unresolved(node, attrs, key)) {
      known = false;
      continue;
    }
    const value = Number(text(attrs[key]) || Number.NaN);
    const valid =
      key === "x" || key === "y" ? value >= 0 && value <= 100 : value > 0 && value <= 100;
    if (!valid)
      issues.push(
        `${where}: \`${key}\` must be a percentage of the image, from 0 to 100 (got ${JSON.stringify(attrs[key] ?? null)}).`,
      );
    else box[key] = value;
  }
  if (known && (box.x + box.w > EDGE || box.y + box.h > EDGE))
    issues.push(
      `${where}: the box runs past the image edge (x + w and y + h must stay within 100).`,
    );

  const mark = text(attrs.mark) || "box";
  if (!isMark(mark))
    issues.push(
      `${where}: \`mark\` must be one of ${Object.keys(marks).join(", ")} (got "${mark}").`,
    );
  const color = text(attrs.color);
  if (color && !isColor(color))
    issues.push(`${where}: \`color\` must be ${PALETTE.join(", ")}, or a hex color like #e5484d.`);
  const side = text(attrs.side);
  const knownSide = SIDES.find((item) => item === side);
  if (side && !knownSide) issues.push(`${where}: \`side\` must be left or right (got "${side}").`);
  const note = children(node);
  if (!hasContent(note)) issues.push(`${where}: write a note explaining what the mark points at.`);
  nested(note, where, issues);

  return {
    ...box,
    mark: isMark(mark) ? mark : "box",
    color: isColor(color) ? color : undefined,
    side: knownSide,
    note,
  };
}

// Screenshots, compares, and annotations only work as direct children; deeper ones would be dropped or unchecked.
function nested(nodes: Node[], where: string, issues: string[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "screenshot" || node[0] === "compare" || node[0] === "annotation")
      issues.push(
        `${where}: \`${node[0]}\` can't go inside a note or caption.${node[0] === "annotation" ? " Annotations must be direct children of a screenshot." : ""}`,
      );
    else nested(children(node), where, issues);
  }
}

/** Reads a `::compare` node: two screenshots numbered as one sequence, labelled Before and After unless they say otherwise. */
export function readCompare(node: ElementNode, issues: string[], data: Data): Screenshot[] {
  const shots: Screenshot[] = [];
  const viewports: string[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "screenshot") {
      const all = shots.flatMap((item) => item.annotations);
      const shot = readScreenshot(child, issues, data, {
        n: 1 + all.length,
        number: 1 + all.filter((annotation) => annotation.number).length,
      });
      shots.push({ ...shot, label: shot.label ?? (shots.length ? "After" : "Before") });
      viewports.push(text(props(child, data).viewport));
    } else if (isElement(child) || text(child))
      issues.push("compare: only `screenshot` blocks can go inside a compare.");
  }
  if (shots.length !== 2)
    issues.push(`compare: needs exactly two screenshots, before and after (got ${shots.length}).`);
  if (viewports[0] && viewports[1] && viewports[0] !== viewports[1])
    issues.push(
      `compare: the screenshots were captured at different viewports (${viewports[0]} and ${viewports[1]}), so they can't be compared.`,
    );
  return shots;
}

/** Every problem in a document's screenshots, compares, and annotations. */
export function check(nodes: Node[], data: Data, issues: string[] = []): string[] {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "compare") readCompare(node, issues, data);
    else if (node[0] === "screenshot") readScreenshot(node, issues, data);
    else if (node[0] === "annotation") issues.push("annotation: must be inside a screenshot.");
    else check(children(node), data, issues);
  }
  return issues;
}

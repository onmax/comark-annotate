import type { ElementNode, Node } from "comark";
import { textContent } from "comark/utils";
import { type Mark, marks } from "./marks.ts";

export interface Annotation {
  n: number;
  x: number;
  y: number;
  w: number;
  h: number;
  mark: Mark;
  color?: string;
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

const isElement = (node: Node): node is ElementNode =>
  Array.isArray(node) && typeof node[0] === "string";
const children = (node: ElementNode) => node.slice(2) as Node[];
const text = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
const COLOR = /^(?:#[\da-f]{3,8}|[a-z]+)$/i;
// Allow half a percent of rounding error when an agent converts pixels to percentages.
const EDGE = 100.5;

/** Reads a `::screenshot` node, numbering its annotations from `first`. Problems go to `issues`; rendering never throws. */
export function readScreenshot(node: ElementNode, issues: string[], first = 1): Screenshot {
  const attrs = node[1];
  const src = text(attrs.src);
  const where = `screenshot "${src || "?"}"`;
  if (!src) issues.push(`${where}: \`src\` is required.`);
  const alt = text(attrs.alt);
  if (!alt) issues.push(`${where}: \`alt\` is required. Describe what the screenshot shows.`);
  const url = text(attrs.url);
  if (url && !/^https?:\/\//.test(url))
    issues.push(`${where}: \`url\` must start with http:// or https://.`);

  const annotations: Annotation[] = [];
  const caption: Node[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "annotation") {
      const annotation = readAnnotation(
        child,
        `${where}, annotation ${first + annotations.length}`,
        issues,
      );
      annotations.push({ ...annotation, n: first + annotations.length });
    } else caption.push(child);
  }
  return {
    src,
    alt,
    label: text(attrs.label) || undefined,
    url: url.startsWith("http") ? url : undefined,
    annotations,
    caption,
  };
}

function readAnnotation(node: ElementNode, where: string, issues: string[]): Omit<Annotation, "n"> {
  const attrs = node[1];
  const box = { x: 0, y: 0, w: 0, h: 0 };
  for (const key of ["x", "y", "w", "h"] as const) {
    const value = Number(text(attrs[key]) || Number.NaN);
    const valid =
      key === "x" || key === "y" ? value >= 0 && value <= 100 : value > 0 && value <= 100;
    if (!valid)
      issues.push(
        `${where}: \`${key}\` must be a percentage of the image, from 0 to 100 (got ${JSON.stringify(attrs[key] ?? null)}).`,
      );
    else box[key] = value;
  }
  if (box.x + box.w > EDGE || box.y + box.h > EDGE)
    issues.push(
      `${where}: the box runs past the image edge (x + w and y + h must stay within 100).`,
    );

  const mark = text(attrs.mark) || "box";
  if (!(mark in marks))
    issues.push(
      `${where}: \`mark\` must be one of ${Object.keys(marks).join(", ")} (got "${mark}").`,
    );
  const color = text(attrs.color);
  if (color && !COLOR.test(color))
    issues.push(`${where}: \`color\` must be a hex color or a CSS color name.`);
  if (!textContent(node).trim())
    issues.push(`${where}: write a note explaining what the mark points at.`);

  return {
    ...box,
    mark: mark in marks ? (mark as Mark) : "box",
    color: COLOR.test(color) ? color : undefined,
    note: children(node),
  };
}

/** Reads a `::compare` node: two screenshots numbered as one sequence, labelled Before and After unless they say otherwise. */
export function readCompare(node: ElementNode, issues: string[]): Screenshot[] {
  const shots: Screenshot[] = [];
  for (const child of children(node)) {
    if (isElement(child) && child[0] === "screenshot") {
      const shot = readScreenshot(
        child,
        issues,
        1 + shots.reduce((sum, item) => sum + item.annotations.length, 0),
      );
      shots.push({ ...shot, label: shot.label ?? (shots.length ? "After" : "Before") });
    } else if (isElement(child) || text(child))
      issues.push("compare: only `screenshot` blocks can go inside a compare.");
  }
  if (shots.length !== 2)
    issues.push(`compare: needs exactly two screenshots, before and after (got ${shots.length}).`);
  const [before, after] = children(node)
    .filter(isElement)
    .filter((child) => child[0] === "screenshot");
  const viewports = [before, after].map((shot) => text(shot?.[1].viewport));
  if (viewports[0] && viewports[1] && viewports[0] !== viewports[1])
    issues.push(
      `compare: the screenshots were captured at different viewports (${viewports[0]} and ${viewports[1]}), so they can't be compared.`,
    );
  return shots;
}

/** Every problem in a document's screenshots, compares, and annotations. */
export function check(nodes: Node[], issues: string[] = []): string[] {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "compare") readCompare(node, issues);
    else if (node[0] === "screenshot") readScreenshot(node, issues);
    else if (node[0] === "annotation") issues.push("annotation: must be inside a screenshot.");
    else check(children(node), issues);
  }
  return issues;
}

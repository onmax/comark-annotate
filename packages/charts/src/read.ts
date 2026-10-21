import type { ElementNode, Node } from "comark";
import type { Annotation } from "comark-annotate";
import { readMark } from "comark-annotate";
import { textContent } from "comark/utils";

export type ChartType =
  | "bar"
  | "stacked"
  | "line"
  | "area"
  | "scatter"
  | "dumbbell"
  | "waterfall"
  | "pie";

/** How the x values read: dates and numbers sit on a scale, anything else is a name. */
export type XKind = "year" | "month" | "date" | "time" | "number" | "name";

/** A chart as the plugin checked it and the renderer draws it. */
export interface Chart {
  type: ChartType;
  title: string;
  /** The x column's header. */
  x: string;
  xKind: XKind;
  /** The headers of the columns drawn as series, in table order. */
  series: string[];
  /** One row per table row: its x value and one number per series, or undefined for an empty or unreadable cell. */
  rows: { x: string; values: (number | undefined)[] }[];
  marks: ChartMark[];
}

/**
 * A comark-annotate annotation that points at data: the row whose x it names, and the series when it names one. The
 * renderer finds the box from the drawn chart.
 */
export interface ChartMark extends Omit<Annotation, "x" | "y" | "w" | "h"> {
  row: number;
  series?: string;
}

export const TYPES: readonly ChartType[] = [
  "bar",
  "stacked",
  "line",
  "area",
  "scatter",
  "dumbbell",
  "waterfall",
  "pie",
];
const PROPS = new Set(["type", "x", "y", "title", "class", "id"]);
const MARK_PROPS = new Set(["at", "series", "mark", "color", "side", "class", "id"]);

const KINDS: [XKind, RegExp][] = [
  ["year", /^\d{4}$/],
  ["month", /^\d{4}-\d{2}$/],
  ["date", /^\d{4}-\d{2}-\d{2}$/],
  ["time", /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/],
];
// Commas only as thousands separators, so `1,200` reads as 1200 and `1,5` is rejected rather than misread.
const NUMBER = /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const childrenOf = ([, , ...rest]: ElementNode): Node[] => rest;
const isContent = (node: Node) => (Array.isArray(node) ? node[0] !== null : node.trim() !== "");
const elements = (node: ElementNode, tag: string) =>
  childrenOf(node).filter((child): child is ElementNode => isElement(child) && child[0] === tag);
const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean).trim();
const code = (value: string) => `\`${value.replaceAll("`", "'")}\``;
const list = (values: string[], last = "and") =>
  values.length < 2
    ? values.join("")
    : `${values.slice(0, -1).join(", ")} ${last} ${values[values.length - 1]}`;

export const readNumber = (cell: string): number | undefined =>
  NUMBER.test(cell) ? Number(cell.replaceAll(",", "")) : undefined;

function kindOf(values: string[]): XKind {
  for (const [kind, pattern] of KINDS)
    if (values.every((value) => pattern.test(value))) return kind;
  return values.every((value) => readNumber(value) !== undefined) ? "number" : "name";
}

/**
 * Reads a `::chart` node, its props and the Markdown table inside it. Returns undefined when there's nothing to draw;
 * every problem goes to `issues` as one sentence that names the block and the fix.
 */
export function readChart(node: ElementNode, number: number, issues: string[]): Chart | undefined {
  const name = `\`::chart\` ${number}`;
  const attrs = node[1];
  for (const key of Object.keys(attrs))
    if (!PROPS.has(key))
      issues.push(
        `${name}: ${code(key)} isn't a prop of \`::chart\`. Valid props: type, x, y, title.`,
      );

  const content = childrenOf(node).filter(isContent);
  const table = content.find(
    (child): child is ElementNode => isElement(child) && child[0] === "table",
  );
  if (!table) {
    issues.push(
      `${name} has no table to draw. Put a Markdown table between \`::chart\` and \`::\`: a header row, then one row per point.`,
    );
    return;
  }
  const annotations = content.filter(
    (child): child is ElementNode => isElement(child) && child[0] === "annotation",
  );
  if (content.length > 1 + annotations.length)
    issues.push(
      `${name} drops everything inside it but its table and annotations. Name the chart with \`title\`, and write other text outside the block.`,
    );

  const [head] = elements(table, "thead");
  const [body] = elements(table, "tbody");
  const headers = head ? elements(head, "tr").flatMap((row) => elements(row, "th")) : [];
  const columns = headers.map((cell) => textContent(cell).trim());
  const cells = (body ? elements(body, "tr") : []).map((row) =>
    elements(row, "td").map((cell) => textContent(cell).trim()),
  );
  if (columns.length < 2) {
    issues.push(
      `${name}: its table needs at least two columns, the x values first and then the numbers.`,
    );
    return;
  }
  const unnamed = columns.findIndex((column) => !column);
  if (unnamed !== -1) {
    issues.push(
      `${name}: column ${unnamed + 1} of its table has no header. Name it, since the name labels the chart.`,
    );
    return;
  }
  const repeated = columns.find((column, index) => columns.indexOf(column) !== index);
  if (repeated) {
    issues.push(
      `${name}: its table has two columns named ${code(repeated)}. Give each column its own name.`,
    );
    return;
  }
  if (!cells.length) {
    issues.push(`${name}: its table has a header but no rows. Add one row per point.`);
    return;
  }
  const known = list(columns.map(code));

  const x = text(attrs.x) || columns[0]!;
  const xIndex = columns.indexOf(x);
  if (xIndex === -1) {
    issues.push(`${name}: \`x\` names column ${code(x)}, but its table has ${known}.`);
    return;
  }
  const y = text(attrs.y);
  const named = y
    ? y
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : columns.filter((column) => column !== x);
  const missing = named.filter((column) => !columns.includes(column));
  if (missing.length) {
    issues.push(
      `${name}: \`y\` names ${missing.length > 1 ? "columns" : "column"} ${list(missing.map(code))}, but its table has ${known}. Separate several with commas, as in \`y="before, after"\`.`,
    );
    return;
  }
  if (named.includes(x)) {
    issues.push(`${name}: column ${code(x)} is both \`x\` and \`y\`. Remove it from \`y\`.`);
    return;
  }

  const rows = cells.map((row, index) => {
    const xValue = row[xIndex] ?? "";
    if (!xValue)
      issues.push(`${name}: row ${index + 1} has no ${code(x)}. Fill it in, or remove the row.`);
    const values = named.map((column) => {
      const cell = row[columns.indexOf(column)] ?? "";
      const value = readNumber(cell);
      if (cell && value === undefined)
        issues.push(
          `${name}: row ${index + 1} has ${code(cell)} in ${code(column)}, which isn't a number. Write the number alone, such as \`1200\` or \`1,200\`, and put the unit in the header, such as \`${column} (ms)\`.`,
        );
      return value;
    });
    return { x: xValue, values };
  });
  const points = rows.filter((row) => row.x);
  // A scatter plot may repeat an x; elsewhere a repeat is a copy-paste slip that bars would quietly add up.
  const firstOf = new Map<string, number>();
  for (const [index, row] of rows.entries()) {
    if (!row.x) continue;
    const first = firstOf.get(row.x);
    if (first === undefined) firstOf.set(row.x, index);
    else if (text(attrs.type) !== "scatter") {
      issues.push(
        `${name}: rows ${first + 1} and ${index + 1} both have ${code(row.x)} in ${code(x)}. Give each row its own ${code(x)}, or add the rows up into one.`,
      );
      break;
    }
  }
  const xKind = kindOf(points.map((row) => row.x));

  const typeText = text(attrs.type);
  const fallback: ChartType = xKind === "name" ? "bar" : "line";
  let type = TYPES.find((type) => type === typeText) ?? fallback;
  if (typeText && type !== typeText)
    issues.push(
      `${name}: \`type="${typeText}"\` isn't a chart type. Use ${list(
        TYPES.map((type) => `\`${type}\``),
        "or",
      )}.`,
    );
  if (type === "scatter" && xKind !== "number") {
    issues.push(
      `${name}: a scatter plot needs numbers in ${code(x)}, its \`x\`. Use \`type="${fallback}"\`, or make \`x\` a column of numbers.`,
    );
    type = fallback;
  }
  if (type === "dumbbell" && named.length < 2) {
    issues.push(
      `${name}: a dumbbell joins two or more columns of numbers per row, such as \`before\` and \`after\`, and this one has ${code(named[0]!)}. Add a column, or use \`type="bar"\`.`,
    );
    type = "bar";
  }
  if ((type === "line" || type === "area") && points.length < 2) {
    issues.push(
      `${name}: ${type === "area" ? "an area" : "a line"} needs at least two rows to draw, and this one has one. Add a row, or use \`type="bar"\`.`,
    );
    type = "bar";
  }
  let series = named;
  if ((type === "pie" || type === "waterfall") && named.length > 1) {
    issues.push(
      `${name}: a ${type} shows one column of numbers, and this one has ${list(named.map(code))}. Name one with \`y\`, or use \`type="bar"\`.`,
    );
    series = named.slice(0, 1);
  }
  if (type === "pie" && points.every((row) => !row.values[0])) {
    issues.push(
      `${name}: a pie of ${code(series[0]!)} has nothing to divide, since every number is 0 or empty. Use \`type="bar"\`, or check the numbers.`,
    );
    type = "bar";
  }
  if (type === "pie" && points.some((row) => (row.values[0] ?? 0) < 0)) {
    issues.push(
      `${name}: a pie can't show negative numbers. Use \`type="bar"\` for ${code(series[0]!)}.`,
    );
    type = "bar";
  }
  const marks: ChartMark[] = [];
  let stamp = 1;
  for (const [index, child] of annotations.entries()) {
    const where = `${name}, annotation ${index + 1}`;
    const found: string[] = [];
    const markAttrs = child[1];
    for (const key of Object.keys(markAttrs))
      if (!MARK_PROPS.has(key))
        found.push(
          `${code(key)} isn't a prop of an annotation in a chart. Point at a row with \`at\`, and a column with \`series\`.`,
        );
    const mark = readMark(child, markAttrs, found);
    const at = text(markAttrs.at);
    const row = points.findIndex((point) => point.x === at);
    const sample = points
      .slice(0, 3)
      .map((point) => code(point.x))
      .join(", ");
    if (!at)
      found.push(
        `\`at\` is required: the ${code(x)} of the row it marks, one of ${sample}${points.length > 3 ? "…" : ""}.`,
      );
    else if (row === -1)
      found.push(
        `\`at="${at}"\` isn't a ${code(x)} in the table. Copy it from the table, such as ${sample}.`,
      );
    const seriesName = text(markAttrs.series);
    if (seriesName && !series.includes(seriesName))
      found.push(
        `\`series="${seriesName}"\` isn't a column the chart draws. Use ${list(series.map(code), "or")}, or leave it out to mark the whole row.`,
      );
    issues.push(...found.map((problem) => `${where}: ${problem}`));
    if (row === -1) continue;
    marks.push({
      ...mark,
      n: index + 1,
      number: mark.side ? undefined : stamp++,
      row,
      series: series.includes(seriesName) ? seriesName : undefined,
    });
  }
  return {
    type,
    title: text(attrs.title),
    x,
    xKind,
    series,
    rows: points.map((row) => ({ x: row.x, values: row.values.slice(0, series.length) })),
    marks,
  };
}

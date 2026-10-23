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

/** A chart drawn from a Vega-Lite spec over the table: any chart Vega-Lite draws, with the table as its data. */
export interface SpecChart {
  type: "vega-lite";
  title: string;
  /** The table's headers, in order. */
  columns: string[];
  /** One object per row, keyed by header: a number where the cell reads as one, else its text, and null when empty. */
  values: Record<string, number | string | null>[];
  spec: Record<string, unknown>;
}

/**
 * One problem with a chart, and the comark-linter rule it falls under. comark-annotate checks an annotation's mark,
 * color, side, and note, so those come under its rules, as they do on a screenshot.
 */
export type Issue =
  | { rule: `comark/charts/${string}`; message: string }
  | Parameters<typeof readMark>[2][number];

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
const isSpec = (node: Node): node is ElementNode =>
  isElement(node) && node[0] === "pre" && node[1].language === "vega-lite";
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
export function readChart(
  node: ElementNode,
  number: number,
  issues: Issue[],
): Chart | SpecChart | undefined {
  const name = `\`::chart\` ${number}`;
  const attrs = node[1];
  // A chart drawn from a spec checks its props itself.
  const spec = childrenOf(node).find(isSpec);
  for (const key of Object.keys(attrs))
    if (!spec && !PROPS.has(key))
      issues.push({
        rule: "comark/charts/unknown-prop",
        message: `${name}: ${code(key)} isn't a prop of \`::chart\`. Valid props: type, x, y, title.`,
      });

  const content = childrenOf(node).filter(isContent);
  const table = content.find(
    (child): child is ElementNode => isElement(child) && child[0] === "table",
  );
  if (!table) {
    issues.push({
      rule: "comark/charts/missing-table",
      message: `${name} has no table to draw. Put a Markdown table between \`::chart\` and \`::\`: a header row, then one row per point.`,
    });
    return;
  }
  const annotations = content.filter(
    (child): child is ElementNode => isElement(child) && child[0] === "annotation",
  );
  if (spec)
    return readSpec(name, attrs, table, spec, content.length - 2, annotations.length, issues);
  if (content.length > 1 + annotations.length)
    issues.push({
      rule: "comark/charts/content-dropped",
      message: `${name} drops everything inside it but its table and annotations. Name the chart with \`title\`, and write other text outside the block.`,
    });

  const [head] = elements(table, "thead");
  const [body] = elements(table, "tbody");
  const headers = head ? elements(head, "tr").flatMap((row) => elements(row, "th")) : [];
  const columns = headers.map((cell) => textContent(cell).trim());
  const cells = (body ? elements(body, "tr") : []).map((row) =>
    elements(row, "td").map((cell) => textContent(cell).trim()),
  );
  if (columns.length < 2) {
    issues.push({
      rule: "comark/charts/too-few-columns",
      message: `${name}: its table needs at least two columns, the x values first and then the numbers.`,
    });
    return;
  }
  const unnamed = columns.findIndex((column) => !column);
  if (unnamed !== -1) {
    issues.push({
      rule: "comark/charts/unnamed-column",
      message: `${name}: column ${unnamed + 1} of its table has no header. Name it, since the name labels the chart.`,
    });
    return;
  }
  const repeated = columns.find((column, index) => columns.indexOf(column) !== index);
  if (repeated) {
    issues.push({
      rule: "comark/charts/duplicate-column",
      message: `${name}: its table has two columns named ${code(repeated)}. Give each column its own name.`,
    });
    return;
  }
  if (!cells.length) {
    issues.push({
      rule: "comark/charts/empty-table",
      message: `${name}: its table has a header but no rows. Add one row per point.`,
    });
    return;
  }
  const known = list(columns.map(code));

  const x = text(attrs.x) || columns[0]!;
  const xIndex = columns.indexOf(x);
  if (xIndex === -1) {
    issues.push({
      rule: "comark/charts/unknown-column",
      message: `${name}: \`x\` names column ${code(x)}, but its table has ${known}.`,
    });
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
    issues.push({
      rule: "comark/charts/unknown-column",
      message: `${name}: \`y\` names ${missing.length > 1 ? "columns" : "column"} ${list(missing.map(code))}, but its table has ${known}. Separate several with commas, as in \`y="before, after"\`.`,
    });
    return;
  }
  if (named.includes(x)) {
    issues.push({
      rule: "comark/charts/x-in-y",
      message: `${name}: column ${code(x)} is both \`x\` and \`y\`. Remove it from \`y\`.`,
    });
    return;
  }

  const rows = cells.map((row, index) => {
    const xValue = row[xIndex] ?? "";
    if (!xValue)
      issues.push({
        rule: "comark/charts/missing-x",
        message: `${name}: row ${index + 1} has no ${code(x)}. Fill it in, or remove the row.`,
      });
    const blank = named.map((column) => !row[columns.indexOf(column)]);
    const values = named.map((column) => {
      const cell = row[columns.indexOf(column)] ?? "";
      const value = readNumber(cell);
      if (cell && value === undefined)
        issues.push({
          rule: "comark/charts/non-numeric-value",
          message: `${name}: row ${index + 1} has ${code(cell)} in ${code(column)}, which isn't a number. Write the number alone, such as \`1200\` or \`1,200\`, and put the unit in the header, such as \`${column} (ms)\`.`,
        });
      return value;
    });
    return { x: xValue, values, blank };
  });
  const points = rows.filter((row) => row.x);
  // A scatter plot may repeat an x; elsewhere a repeat is a copy-paste slip that bars would quietly add up.
  const firstOf = new Map<string, number>();
  for (const [index, row] of rows.entries()) {
    if (!row.x) continue;
    const first = firstOf.get(row.x);
    if (first === undefined) firstOf.set(row.x, index);
    else if (text(attrs.type) !== "scatter") {
      issues.push({
        rule: "comark/charts/duplicate-x",
        message: `${name}: rows ${first + 1} and ${index + 1} both have ${code(row.x)} in ${code(x)}. Give each row its own ${code(x)}, or add the rows up into one.`,
      });
      break;
    }
  }
  const xKind = kindOf(points.map((row) => row.x));

  const typeText = text(attrs.type);
  const fallback: ChartType = xKind === "name" ? "bar" : "line";
  let type = TYPES.find((type) => type === typeText) ?? fallback;
  if (typeText && type !== typeText)
    issues.push({
      rule: "comark/charts/unknown-type",
      message: `${name}: \`type="${typeText}"\` isn't a chart type. Use ${list(
        TYPES.map((type) => `\`${type}\``),
        "or",
      )}.`,
    });
  if (type === "scatter" && xKind !== "number") {
    issues.push({
      rule: "comark/charts/non-numeric-x",
      message: `${name}: a scatter plot needs numbers in ${code(x)}, its \`x\`. Use \`type="${fallback}"\`, or make \`x\` a column of numbers.`,
    });
    type = fallback;
  }
  if (type === "dumbbell" && named.length < 2) {
    issues.push({
      rule: "comark/charts/too-few-series",
      message: `${name}: a dumbbell joins two or more columns of numbers per row, such as \`before\` and \`after\`, and this one has ${code(named[0]!)}. Add a column, or use \`type="bar"\`.`,
    });
    type = "bar";
  }
  if ((type === "line" || type === "area") && points.length < 2) {
    issues.push({
      rule: "comark/charts/too-few-rows",
      message: `${name}: ${type === "area" ? "an area" : "a line"} needs at least two rows to draw, and this one has one. Add a row, or use \`type="bar"\`.`,
    });
    type = "bar";
  }
  let series = named;
  if ((type === "pie" || type === "waterfall") && named.length > 1) {
    issues.push({
      rule: "comark/charts/too-many-series",
      message: `${name}: a ${type} shows one column of numbers, and this one has ${list(named.map(code))}. Name one with \`y\`, or use \`type="bar"\`.`,
    });
    series = named.slice(0, 1);
  }
  if (type === "pie" && points.every((row) => !row.values[0])) {
    issues.push({
      rule: "comark/charts/invalid-pie-values",
      message: `${name}: a pie of ${code(series[0]!)} has nothing to divide, since every number is 0 or empty. Use \`type="bar"\`, or check the numbers.`,
    });
    type = "bar";
  }
  if (type === "pie" && points.some((row) => (row.values[0] ?? 0) < 0)) {
    issues.push({
      rule: "comark/charts/invalid-pie-values",
      message: `${name}: a pie can't show negative numbers. Use \`type="bar"\` for ${code(series[0]!)}.`,
    });
    type = "bar";
  }
  const marks: ChartMark[] = [];
  let stamp = 1;
  for (const [index, child] of annotations.entries()) {
    const where = `${name}, annotation ${index + 1}`;
    const found: Issue[] = [];
    const markAttrs = child[1];
    for (const key of Object.keys(markAttrs))
      if (!MARK_PROPS.has(key))
        found.push({
          rule: "comark/charts/unknown-prop",
          message: `${code(key)} isn't a prop of an annotation in a chart. Point at a row with \`at\`, and a column with \`series\`.`,
        });
    const markProblems: Parameters<typeof readMark>[2] = [];
    const mark = readMark(child, markAttrs, markProblems);
    found.push(...markProblems);
    const at = text(markAttrs.at);
    const row = points.findIndex((point) => point.x === at);
    const sample = points
      .slice(0, 3)
      .map((point) => code(point.x))
      .join(", ");
    if (!at)
      found.push({
        rule: "comark/charts/invalid-at",
        message: `\`at\` is required: the ${code(x)} of the row it marks, one of ${sample}${points.length > 3 ? "…" : ""}.`,
      });
    else if (row === -1)
      found.push({
        rule: "comark/charts/invalid-at",
        message: `\`at="${at}"\` isn't a ${code(x)} in the table. Copy it from the table, such as ${sample}.`,
      });
    const seriesName = text(markAttrs.series);
    if (seriesName && !series.includes(seriesName))
      found.push({
        rule: "comark/charts/unknown-series",
        message: `\`series="${seriesName}"\` isn't a column the chart draws. Use ${list(series.map(code), "or")}, or leave it out to mark the whole row.`,
      });
    const blank = points[row]?.blank;
    const column = series.indexOf(seriesName);
    if (blank && column !== -1 && blank[column])
      found.push({
        rule: "comark/charts/marks-empty-cell",
        message: `\`at="${at}"\` marks an empty ${code(seriesName)} cell, so the mark isn't drawn. Fill in the cell, or mark another row.`,
      });
    else if (blank && !seriesName && series.every((_, index) => blank[index]))
      found.push({
        rule: "comark/charts/marks-empty-cell",
        message: `\`at="${at}"\` marks a row with no numbers, so the mark isn't drawn. Fill in the row, or mark another one.`,
      });
    issues.push(
      ...found.map((problem) => ({ ...problem, message: `${where}: ${problem.message}` })),
    );
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

/** Every value of `key` in an object, however deep: the fields a spec reads, or the ones its transforms make. */
function collect(value: unknown, key: string, found: string[] = []): string[] {
  if (Array.isArray(value)) for (const item of value) collect(item, key, found);
  else if (value instanceof Object)
    for (const [name, item] of Object.entries(value)) {
      if (name === key)
        for (const part of [item].flat()) {
          const field = text(part);
          if (field) found.push(field);
        }
      collect(item, key, found);
    }
  return found;
}

function readSpec(
  name: string,
  attrs: ElementNode[1],
  table: ElementNode,
  pre: ElementNode,
  others: number,
  annotations: number,
  issues: Issue[],
): SpecChart | undefined {
  for (const key of Object.keys(attrs))
    if (key !== "title" && key !== "class" && key !== "id")
      issues.push({
        rule: "comark/charts/spec-with-props",
        message: `${name}: ${code(key)} doesn't apply to a chart drawn from a Vega-Lite spec. Name the columns in the spec's \`encoding\` instead.`,
      });
  if (annotations)
    issues.push({
      rule: "comark/charts/spec-with-annotations",
      message: `${name}: annotations mark charts comark-charts lays out, not one drawn from a Vega-Lite spec. Remove them, or draw the note with a \`text\` or \`rule\` layer in the spec.`,
    });
  if (others > annotations)
    issues.push({
      rule: "comark/charts/content-dropped",
      message: `${name} drops everything inside it but its table and its Vega-Lite spec. Name the chart with \`title\`, and write other text outside the block.`,
    });
  let spec: unknown;
  try {
    spec = JSON.parse(textContent(pre));
  } catch (error) {
    issues.push({
      rule: "comark/charts/invalid-spec-json",
      message: `${name}: its Vega-Lite spec isn't valid JSON (${error instanceof Error ? error.message : String(error)}). Fix it, or remove the \`vega-lite\` block to let comark-charts choose the chart.`,
    });
    return;
  }
  if (!(spec instanceof Object) || Array.isArray(spec)) {
    issues.push({
      rule: "comark/charts/invalid-spec-json",
      message: `${name}: its Vega-Lite spec must be one JSON object, such as \`{"mark": "bar", "encoding": {...}}\`.`,
    });
    return;
  }
  const head = elements(table, "thead")[0];
  const body = elements(table, "tbody")[0];
  const columns = (head ? elements(head, "tr").flatMap((row) => elements(row, "th")) : []).map(
    (cell) => textContent(cell).trim(),
  );
  const rows = (body ? elements(body, "tr") : []).map((row) =>
    elements(row, "td").map((cell) => textContent(cell).trim()),
  );
  const unnamed = columns.findIndex((column) => !column);
  const repeated = columns.find((column, index) => columns.indexOf(column) !== index);
  if (unnamed !== -1 || repeated || !rows.length) {
    issues.push(
      unnamed !== -1
        ? {
            rule: "comark/charts/unnamed-column",
            message: `${name}: column ${unnamed + 1} of its table has no header. Name it, since the spec reads columns by name.`,
          }
        : repeated
          ? {
              rule: "comark/charts/duplicate-column",
              message: `${name}: its table has two columns named ${code(repeated)}. Give each column its own name.`,
            }
          : {
              rule: "comark/charts/empty-table",
              message: `${name}: its table has no rows. Add one row per data point; the spec draws the table.`,
            },
    );
    return;
  }
  if ("data" in spec)
    issues.push({
      rule: "comark/charts/spec-with-data",
      message: `${name}: its Vega-Lite spec has \`data\`, but a chart's data is its table, so the table replaces it. Remove \`data\` from the spec.`,
    });
  // Fields made by transforms, such as a fold's `key` and `value`, are as real as the table's.
  const made = new Set([
    ...collect(spec, "as"),
    ...(collect(spec, "fold").length ? ["key", "value"] : []),
  ]);
  // A dot or a bracket reaches into nested data, which a table has none of, so only plain names are checked.
  const unknown = [...new Set(collect(spec, "field"))].filter(
    (field) => !columns.includes(field) && !made.has(field) && !/[.[\\]/.test(field),
  );
  if (unknown.length)
    issues.push({
      rule: "comark/charts/unknown-spec-field",
      message: `${name}: its Vega-Lite spec reads ${unknown.length > 1 ? "fields" : "field"} ${list(unknown.map(code))}, but its table has ${list(columns.map(code))}. Use the table's headers as field names.`,
    });
  // SAFETY: JSON.parse returned an object that isn't an array, so its keys are strings.
  const rest = { ...(spec as Record<string, unknown>) };
  delete rest.data;
  return {
    type: "vega-lite",
    title: text(attrs.title),
    columns,
    values: rows.map((row) =>
      Object.fromEntries(
        columns.map((column, index) => {
          const cell = row[index] ?? "";
          return [column, cell ? (readNumber(cell) ?? cell) : null];
        }),
      ),
    ),
    spec: rest,
  };
}

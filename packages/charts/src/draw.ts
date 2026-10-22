import type { ChartAssemblyInput, ThemeSpec } from "flint-chart";
import { assembleVegaLite } from "flint-chart";
import * as vega from "vega";
import { expressionInterpreter } from "vega-interpreter";
import type { TopLevelSpec } from "vega-lite";
import type { Field } from "vega-lite/types_unstable/channeldef.js";
import type { LayerSpec, UnitSpec } from "vega-lite/types_unstable/spec/index.js";
import { compile } from "vega-lite";
import { INK, SERIES } from "./colors.ts";
import type { Chart, SpecChart, XKind } from "./read.ts";

const { logger, None, parse, View } = vega;

// Shares of an em in a sans-serif, a little wide so that text guessed to fit does.
const EM = [
  [/\p{Extended_Pictographic}/u, 1.3],
  [
    /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/u,
    1.05,
  ],
  [/[ijlI|!.,:;'`()[\]{}]/u, 0.32],
  [/[frt ]/u, 0.4],
  [/[mwMW@%]/u, 0.9],
  [/[A-Z]/u, 0.7],
  [/\d/u, 0.6],
] as const;
// Graphemes, so a family or a flag emoji counts as the one glyph it draws.
const graphemes = new Intl.Segmenter();
const guess = (text: string, size: number) => {
  let width = 0;
  for (const { segment } of graphemes.segment(text))
    width += EM.find(([kind]) => kind.test(segment))?.[1] ?? 0.58;
  return width * size;
};

// Without a canvas Vega guesses every character at 0.8em, wider than most letters, so greedy overlap hides labels that
// fit and limits cut others short. Vega takes a better guess through `textMetrics.width`, the hook vl-convert uses,
// though vega-typings leaves it out. Clamped at the item's limit, it serves both Vega's truncation and its bounds.
interface TextItem {
  fontSize?: number;
  limit?: number;
}
const metrics: unknown = Reflect.get(vega, "textMetrics");
if (
  metrics &&
  Reflect.get(Object(metrics), "width") === Reflect.get(Object(metrics), "estimateWidth")
)
  Reflect.set(Object(metrics), "width", (item: TextItem, text: string | number | undefined) =>
    Math.min(item.limit || Infinity, guess(String(text ?? "").trim(), item.fontSize ?? 11)),
  );

const theme: ThemeSpec = {
  extends: "nyt",
  ink: {
    surface: { source: "host" },
    text: {
      primary: INK.foreground,
      secondary: INK.muted,
      muted: INK.muted,
      inverse: INK.background,
    },
    structure: { grid: INK.border, axis: INK.muted, rule: INK.muted, zero: INK.muted },
    series: {
      single: SERIES[0],
      categorical: [...SERIES],
      categoricalExtended: [...SERIES],
      overflow: INK.muted,
      // A waterfall's steps: up, down, and the totals at its ends.
      status: { positive: SERIES[2], negative: SERIES[4], neutral: INK.muted },
    },
    accent: SERIES[1],
  },
  // shadcn/ui's charts: no axis lines or ticks, faint horizontal grid lines, rounded bars, smooth lines without dots, and
  // 12px labels.
  structure: {
    axis: {
      categorical: { line: "omit", ticks: "omit" },
      measure: { line: "omit", ticks: "omit" },
    },
    grid: { measure: "quiet", category: "omit", style: "solid", zero: "omit" },
    frame: "omit",
    baseline: "omit",
  },
  marks: {
    cornerRadius: 4,
    strokeWeight: 2,
    interpolation: "monotone",
    fillOpacity: 0.4,
    point: { presence: "omit" },
  },
  // A value that doesn't fit beside its mark is left to the axis and the data table.
  dataLabels: { show: "whenTheyFit", placement: "outsideMark", inkMode: "fixed" },
  labels: { angle: "horizontal" },
  type: {
    headline: { family: "sans-serif", color: INK.foreground },
    deck: { family: "sans-serif", color: INK.muted },
    axisLabel: { family: "sans-serif", size: 12 },
    keyLabel: { family: "sans-serif", size: 12 },
    valueLabel: { family: "sans-serif", size: 12, weight: "medium" },
  },
  chartDefaults: { "Line Chart": { showPoints: false } },
};

const SEMANTIC: Record<XKind, string> = {
  year: "Year",
  month: "YearMonth",
  date: "Date",
  time: "DateTime",
  number: "Quantity",
  name: "Category",
};

const quiet = logger(None);

// Bars turn sideways when their labels would crowd under them, so long names, such as file paths, stay readable.
const sideways = (chart: Chart) =>
  chart.rows.length * Math.max(1, chart.series.length) > 12 ||
  chart.rows.some((row) => row.x.length > 12);

const longest = (chart: Chart) => Math.max(...chart.rows.map((row) => row.x.length));

/** A label broken between words into lines no wider than `room`, as far as a long word allows. */
function wrap(text: string, room: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && guess(`${last} ${word}`, 12) <= room)
      lines[lines.length - 1] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

// A top legend is one row unless told otherwise, so it wraps into as many columns as fit the card.
function legendColumns(chart: Chart, room = 520) {
  const names =
    chart.type === "pie"
      ? chart.rows.map((row) => row.x)
      : chart.type === "waterfall"
        ? ["total", "increase", "decrease"]
        : chart.series;
  const widest = Math.max(...names.map((name) => name.length)) * 7 + 40;
  return Math.max(1, Math.min(names.length, Math.floor(room / widest)));
}

// Lines are named at their ends, which only reads when the ends sit apart; otherwise a legend names them.
function endsCrowd(chart: Chart) {
  if (chart.series.length > 6) return true;
  // An area names each part inside its last slice, which needs a slice thick enough to hold the name.
  if (chart.type === "area") {
    const total = (row: Chart["rows"][number]) =>
      row.values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    const tallest = Math.max(...chart.rows.map(total));
    const last = chart.rows.at(-1)?.values ?? [];
    return (
      chart.series.length > 4 || tallest <= 0 || last.some((value) => (value ?? 0) / tallest < 0.1)
    );
  }
  // A series that stops early is named where it stops, among the other lines rather than at the end.
  if (chart.rows.at(-1)?.values.some((value) => value === undefined)) return true;
  const values = chart.rows.flatMap((row) => row.values.filter((value) => value !== undefined));
  const span = Math.max(0, ...values) - Math.min(0, ...values) || 1;
  const ends = chart.series
    .map((_, index) => chart.rows.findLast((row) => row.values[index] !== undefined)?.values[index])
    .filter((value) => value !== undefined)
    .sort((a, b) => a - b);
  return ends.some((value, index) => index > 0 && (value - ends[index - 1]!) / span < 0.1);
}

/** The decisions a chart's shape forces before Flint lays it out. */
function layout(chart: Chart) {
  const { type } = chart;
  const many = chart.series.length > 1;
  const flip = type === "dumbbell" || ((type === "bar" || type === "stacked") && sideways(chart));
  const bars = chart.rows.length * (type === "bar" ? chart.series.length : 1);
  // A value printed past a negative bar's end lands among the axis labels when the bar reaches the edge.
  const negative = chart.rows.some((row) => row.values.some((value) => (value ?? 0) < 0));
  // Bars thinner than a line of text can't hold their values, so the value axis reads them instead. Stacked parts are
  // often thinner still, so they never print theirs, as in shadcn/ui.
  const crowded = (type === "bar" && bars > 12) || type === "stacked" || negative;
  // A dumbbell names its series over the first row, where equal values pile the names up, and lines and areas name
  // theirs at their ends, which only reads when the ends sit apart.
  const legend =
    type === "dumbbell" || ((type === "line" || type === "area") && many && endsCrowd(chart));
  // The card leaves about 670px. Labels sit beside the plot, so the plot gets what the widest of them leaves: names on
  // a sideways chart, values on an upright one, and series names at the ends of lines.
  const numbers = chart.rows.flatMap((row) => row.values.filter((value) => value !== undefined));
  const valueLabel =
    Math.max(...numbers.map((value) => Math.round(value).toLocaleString("en-US").length)) * 7;
  const endLabels =
    type === "line" && !legend ? Math.max(...chart.series.map((name) => name.length)) * 7 + 12 : 0;
  const labels = flip ? 7 * longest(chart) + 40 : valueLabel + 40 + endLabels;
  const width = Math.round(Math.max(200, Math.min(520, 600 - labels)));
  return { flip, bars, crowded, legend, width };
}

// Field names are fixed, since Vega-Lite reads dots and brackets in a column's name as a path into the row.
function input(chart: Chart): ChartAssemblyInput {
  const { type } = chart;
  const many = chart.series.length > 1;
  const { flip, bars, crowded, legend, width } = layout(chart);
  // A bar, a step, or a dot row per value, so a numeric x on those is a name.
  const banded =
    type === "bar" || type === "stacked" || type === "waterfall" || type === "dumbbell";
  const kind = banded && chart.xKind === "number" ? "name" : chart.xKind;
  const xValue = (value: string) => (kind === "number" ? Number(value.replaceAll(",", "")) : value);
  // `row` lets a mark find the shapes drawn for its row once the chart is laid out.
  const values = chart.rows.flatMap((row, number) =>
    chart.series.flatMap((series, index) => {
      const y = row.values[index];
      return y === undefined ? [] : [{ x: xValue(row.x), y, series, row: number }];
    }),
  );
  const encodings: Record<string, { field: string }> =
    type === "pie"
      ? { size: { field: "y" }, color: { field: "x" } }
      : flip
        ? { x: { field: "y" }, y: { field: "x" } }
        : { x: { field: "x" }, y: { field: "y" } };
  if (many) encodings[type === "bar" ? "group" : "color"] = { field: "series" };
  const chartType = {
    bar: many ? "Grouped Bar Chart" : "Bar Chart",
    stacked: many ? "Stacked Bar Chart" : "Bar Chart",
    line: "Line Chart",
    area: "Area Chart",
    scatter: "Scatter Plot",
    dumbbell: "Ranged Dot Plot",
    waterfall: "Waterfall Chart",
    pie: "Pie Chart",
  }[type];
  return {
    data: { values },
    semantic_types: { x: SEMANTIC[kind], y: "Quantity", series: "Category" },
    field_display_names: { x: chart.x, y: many ? "" : chart.series[0]!, series: "" },
    chart_spec: {
      chartType,
      encodings,
      baseSize: { width, height: 320 },
      // Flint grows a crowded chart, but only downward: the width is already what the labels leave. Past the canvas
      // Flint drops rows and says "items omitted", so a sideways chart grows as tall as its bars need.
      canvasSize: { width, height: flip ? Math.max(640, bars * 20 + 200) : 640 },
      // Flint packs a band's bars together when some rows lack a series, but it finds the band from the column's
      // type, so over dates it sorts bars into lanes by their value, and some draw zero wide. Every band gets a lane per
      // series instead, as in most grouped bar charts.
      // A waterfall prints its numbers itself, apart from the theme's value labels, and only when asked.
      chartProperties: { dodge: "global", ...(type === "waterfall" && { showTextLabels: true }) },
    },
    options: { maxColorValues: SERIES.length },
    theme_spec: {
      ...theme,
      ...((crowded || (legend && type === "area")) && {
        dataLabels: { ...theme.dataLabels, show: "never" },
      }),
      // The New York Times theme dots a line's ends, and on a dumbbell, which is all ends, that layer repaints some dots
      // in the first series' color.
      ...(type === "dumbbell" && { annotation: { ...theme.annotation, pointEmphasis: "never" } }),
      legend: {
        ...theme.legend,
        maxSwatches: SERIES.length,
        ...(legend && { placement: ["top"] }),
      },
    },
  };
}

type Unit = TopLevelSpec | LayerSpec<Field> | UnitSpec<Field>;
/** A spec and every layer inside it, however deep: Flint nests layers in some templates. */
function units(spec: Unit): Unit[] {
  return "layer" in spec ? [spec, ...spec.layer.flatMap((layer) => units(layer))] : [spec];
}

/** Where a mark sits, as percentages of the SVG, like a comark-annotate box on a screenshot. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Shapes drawn one per value; lines, areas, and labels span several or don't mark a value.
const SHAPES = new Set(["rect", "symbol", "arc"]);
// A mark keeps clear of the shape it circles, and a point gets a box big enough to draw around. A mark that draws
// nothing only leaves its arrow a hair short of the point, so the arrow reaches the data.
const PAD = 6;
const PADDING = { left: 12, right: 12, top: 12, bottom: 12 };
const SMALLEST = 18;
const BARE = 3;

interface SceneItem {
  x?: number;
  y?: number;
  bounds?: { x1: number; y1: number; x2: number; y2: number };
  datum?: { row?: unknown; series?: unknown };
  mark?: { marktype?: string };
  items?: SceneItem[];
}

function boxes(chart: Chart, view: vega.View, width: number, height: number): Map<number, Box> {
  const found = new Map<number, Box>();
  // Vega draws the scene at its origin plus its padding, and origin() leaves the padding out.
  const [x0, y0] = view.origin();
  const [left, top] = [x0 + PADDING.left, y0 + PADDING.top];
  // Vega types its scenegraph as a bare Scene, but at runtime it holds the root group, whose items carry the fields
  // SceneItem names.
  const scene: SceneItem = Reflect.get(view.scenegraph(), "root");
  const walk = (
    item: SceneItem,
    dx: number,
    dy: number,
    visit: (item: SceneItem, dx: number, dy: number) => void,
  ) => {
    visit(item, dx, dy);
    const group = item.mark?.marktype === "group";
    for (const child of item.items ?? [])
      walk(child, dx + (group ? (item.x ?? 0) : 0), dy + (group ? (item.y ?? 0) : 0), visit);
  };
  for (const mark of chart.marks) {
    let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity];
    walk(scene, left, top, (item, dx, dy) => {
      const { datum, bounds } = item;
      if (!bounds || !datum || !SHAPES.has(item.mark?.marktype ?? "")) return;
      if (datum.row !== mark.row || (mark.series && datum.series !== mark.series)) return;
      x1 = Math.min(x1, bounds.x1 + dx);
      y1 = Math.min(y1, bounds.y1 + dy);
      x2 = Math.max(x2, bounds.x2 + dx);
      y2 = Math.max(y2, bounds.y2 + dy);
    });
    if (x1 === Infinity) continue;
    const grow = (from: number, to: number) =>
      mark.mark === "none" ? BARE : Math.max(0, (SMALLEST - (to - from)) / 2) + PAD;
    const [gx, gy] = [grow(x1, x2), grow(y1, y2)];
    const box = {
      x: Math.max(0, x1 - gx),
      y: Math.max(0, y1 - gy),
      w: Math.min(width, x2 + gx) - Math.max(0, x1 - gx),
      h: Math.min(height, y2 + gy) - Math.max(0, y1 - gy),
    };
    const round = (value: number) => Math.round(value * 100) / 100;
    found.set(mark.n, {
      x: round((box.x / width) * 100),
      y: round((box.y / height) * 100),
      w: round((box.w / width) * 100),
      h: round((box.h / height) * 100),
    });
  }
  return found;
}

/** Draws a compiled Vega spec to an SVG string, and returns the view for finding where its marks sit. */
async function render(compiled: vega.Spec, loader?: vega.Loader) {
  // Vega compiles its expressions with `new Function` unless told to interpret them, and Cloudflare Workers, where
  // documents like these often render, forbid that.
  const options: vega.ViewOptions = {
    renderer: "none",
    logLevel: None,
    expr: expressionInterpreter,
  };
  if (loader) options.loader = loader;
  const view = new View(parse(compiled, undefined, { ast: true }), options);
  // Vega gives every group a role for screen readers, which the one `role="img"` hides anyway, an empty foreground
  // path, and float noise such as `10.000000000000021`. Only tags change, since text holds the table's own numbers,
  // and Vega escapes `>` in attributes.
  const svg = (await view.toSVG())
    .replace(/<path class="foreground"[^>]* d=""[^>]*\/>/g, "")
    .replace(/<[^>]+>/g, (tag) =>
      tag
        .replace(/ (?:role|aria-roledescription|aria-hidden)="[^"]*"/g, "")
        .replace(/(\.\d\d)\d+/g, "$1"),
    );
  return { view, svg };
}

/**
 * Draws a chart to an SVG string at the size Flint laid it out for, so its text reads at the size it was set, and
 * finds where each of its marks sits.
 */
export async function draw(chart: Chart): Promise<{ svg: string; boxes: Map<number, Box> }> {
  // SAFETY: Flint declares its output `any`; it is a Vega-Lite spec, and compile() checks it at runtime.
  const spec: TopLevelSpec = assembleVegaLite(input(chart));
  spec.background = "transparent";
  // Flint leaves room above for a headline; the figure's caption is the title, so only the axis title and legend
  // need it, and Vega-Lite's autosize makes room for those.
  spec.padding = PADDING;
  // With several series no one header names the numbers, and Flint would title the axis with the field, `y`. A
  // waterfall's legend sits where its axis title would, and its layers draw running totals rather than `y`.
  const waterfall = chart.type === "waterfall";
  if (chart.series.length > 1 || waterfall)
    for (const unit of units(spec))
      for (const channel of "encoding" in unit ? [unit.encoding?.x, unit.encoding?.y] : [])
        if (channel && "field" in channel && (waterfall || channel.field === "y"))
          channel.title = null;
  // Grid lines run across only, as in shadcn/ui. The theme hides the value axis where numbers sit on the marks, but a
  // waterfall prints none. Its steps read flat when they fit side by side, and Flint angles them when they don't.
  // Flint plans the plot's width, as pixels or as a step per band, so each step's share says whether its label fits
  // flat.
  const planned: unknown = Reflect.get(spec, "width");
  const step =
    Number(Reflect.get(Object(planned), "step")) ||
    (Number(planned) || layout(chart).width) / chart.rows.length;
  // A step's few words wrap onto up to three lines under it before its labels turn sideways.
  const wrapped = chart.rows.map((row) => wrap(row.x, step - 12));
  const flat = wrapped.every(
    (lines) => lines.length <= 3 && lines.every((line) => guess(line, 12) <= step - 12),
  );
  const labelExpr = wrapped.reduceRight(
    (rest, lines, index) =>
      lines.length > 1
        ? `datum.label === ${JSON.stringify(chart.rows[index]!.x)} ? ${JSON.stringify(lines)} : ${rest}`
        : rest,
    "datum.label",
  );
  // Flint scales its type with the plot, from 13.5px down to 8px when long labels leave the plot narrow, and ignores
  // the theme's sizes, so text is set to shadcn/ui's 12px here. Labels that don't fit are thinned or cut instead.
  const TYPE = { labelFontSize: 12, titleFontSize: 12 };
  spec.config = {
    ...spec.config,
    // The SVG is one `role="img"` labeled by its caption, and the table under it is what screen readers and agents
    // read, so a label on every bar only repeats the table.
    aria: false,
    // shadcn/ui's tick margin: with no axis lines, labels need the room to stay apart where the axes meet.
    axisX: {
      ...spec.config?.axisX,
      ...TYPE,
      grid: false,
      labelPadding: 8,
      titlePadding: 10,
      // Labels that would touch are dropped, every other one, rather than drawn over each other.
      labelOverlap: "greedy",
      labelSeparation: 6,
      // Flint anchors a waterfall's labels at their end, for angled text; flat ones center under their step.
      ...(waterfall &&
        (flat
          ? {
              labelAngle: 0,
              labelAlign: "center",
              labelBaseline: "top",
              labelLimit: 160,
              labelExpr,
            }
          : { labelLimit: 140 })),
    },
    axisY: {
      ...spec.config?.axisY,
      ...TYPE,
      labelPadding: 8,
      ...(waterfall && { labels: true, grid: true, gridColor: INK.border }),
    },
    // Vega guesses text widths without a font, short for CJK and emoji, so legend entries get room to spare.
    legend: {
      ...spec.config?.legend,
      ...TYPE,
      columns: legendColumns(chart, layout(chart).width),
      columnPadding: 20,
      rowPadding: 10,
      labelLimit: 200,
    },
    // An area is outlined along its top, so overlapping series stay readable through the translucent fill.
    area: { ...spec.config?.area, line: { strokeWidth: 2 } },
    // Vega-Lite draws points at 0.7 opacity, which muddies their colors on a dark page.
    point: { ...spec.config?.point, opacity: 1 },
    circle: { ...spec.config?.circle, opacity: 1 },
  };
  // Flint names its ticks when it labels every point, and leaves Vega to pick them otherwise.
  const pinned = units(spec).some(
    (unit) =>
      "encoding" in unit &&
      unit.encoding?.x &&
      "axis" in unit.encoding.x &&
      unit.encoding.x.axis &&
      "values" in unit.encoding.x.axis,
  );
  // Flint also sets axes and legends on the encodings, which win over the config, so the same rules go there. A
  // waterfall's first step gets room from the axis corner, where its label would meet the value axis's 0.
  for (const unit of units(spec)) {
    const text = "mark" in unit && unit.mark instanceof Object && unit.mark.type === "text";
    if ("mark" in unit && unit.mark instanceof Object && unit.mark.type === "text")
      unit.mark = { ...unit.mark, fontSize: TYPE.labelFontSize };
    if (!("encoding" in unit) || !unit.encoding) continue;
    // Flint writes an area's names in white, which fades on its translucent fill. The color field stays, since it
    // stacks the names in the order of the areas they sit in.
    const named = unit.encoding.color;
    if (text && chart.type === "area" && named && "scale" in named && named.scale)
      unit.encoding.color = { ...named, scale: { ...named.scale, range: [INK.foreground] } };
    // Flint orders a pie's slices by name and its legend by row, so the slices take the table's order too, clockwise
    // from twelve o'clock.
    if (chart.type === "pie" && unit.encoding.order)
      unit.encoding.order = { field: "row", type: "quantitative" };
    const { color, x, y } = unit.encoding;
    // Vega-Lite pulls the end labels of a time axis inside the plot, off the points they name. Where Flint labels
    // every point, they center under their points instead, and the points keep clear of the plot's ends by about half
    // a label so the first doesn't meet the value axis's 0 in the corner. Padding a scale whose ticks Vega picks would
    // add one before the first point, in that corner.
    const time =
      (chart.type === "line" || chart.type === "area") &&
      pinned &&
      x &&
      "type" in x &&
      x.type === "temporal"
        ? x
        : undefined;
    if (time) time.scale = { ...("scale" in time && time.scale), padding: 24 };
    if (color && "legend" in color && color.legend)
      color.legend = { ...color.legend, columns: legendColumns(chart, layout(chart).width) };
    for (const channel of [x, y])
      if (channel && "axis" in channel && channel.axis)
        channel.axis = {
          ...channel.axis,
          labelPadding: 8,
          labelOverlap: "greedy",
          labelSeparation: 6,
          ...(channel === time && {
            labelFlush: false,
            // "Apr 2026" under every month is too wide for its step, so overlap hides some; the year is said once,
            // and again where it turns.
            ...(chart.xKind === "month" && {
              format: undefined,
              labelExpr:
                'utcFormat(datum.value, datum.index === 0 || utcmonth(datum.value) === 0 ? "%b %Y" : "%b")',
            }),
          }),
        };
    // Vega-Lite rounds a stack as a whole, which costs a clipped group per bar, so bars that stack nothing don't stack.
    // Rows that repeat an `x`, which the plugin reports, still stack rather than hide one behind the other.
    if (chart.type === "bar" && new Set(chart.rows.map((row) => row.x)).size === chart.rows.length)
      for (const channel of [x, y])
        if (channel && "field" in channel && channel.field === "y") channel.stack = null;
    if (waterfall && x && "field" in x && x.field === "x")
      x.scale = { ...("scale" in x && x.scale), paddingOuter: flat ? 0.4 : 1 };
  }
  // Flint colors a waterfall's steps from its palette when the data lacks one kind, so the kinds are pinned.
  if (waterfall && "layer" in spec)
    for (const layer of spec.layer)
      if ("encoding" in layer && layer.encoding?.color && "field" in layer.encoding.color)
        layer.encoding.color = {
          ...layer.encoding.color,
          scale: {
            domain: ["total", "increase", "decrease"],
            range: [INK.muted, SERIES[2], SERIES[4]],
          },
        };
  // Flint prints each step's running total over it and its change inside it, in white on the step, so a total reads
  // twice and a short step loses its change. One number per step reads instead, outside it: a total's value, or a
  // step's change.
  if (waterfall && "layer" in spec) {
    const isText = (layer: (typeof spec.layer)[number]) =>
      "mark" in layer && layer.mark instanceof Object && layer.mark.type === "text";
    const inside = (layer: (typeof spec.layer)[number]) =>
      "encoding" in layer &&
      layer.encoding?.text &&
      "field" in layer.encoding.text &&
      layer.encoding.text.field === "__wf_delta_text";
    // Numbers wider than their step would run into their neighbors', so a crowded waterfall leaves them to the axis.
    const values = chart.rows.map((row) => row.values[0] ?? 0);
    // Keep the inferred final-total rule in sync with Flint: a final value is a
    // total when it reconciles with the preceding cumulative within 0.5%.
    let preceding = 0;
    for (const value of values.slice(0, -1)) preceding += value;
    const finalIsTotal =
      values.length > 1 &&
      Number.isFinite(preceding) &&
      Number.isFinite(values.at(-1)) &&
      Math.abs(values.at(-1)! - preceding) <= Math.max(1e-6, 0.005 * Math.abs(preceding));
    const widest = Math.max(
      ...chart.rows.map((row, index) => {
        const value = row.values[0] ?? 0;
        const signed =
          index > 0 && !(index === values.length - 1 && finalIsTotal) && value > 0 ? "+" : "";
        return guess(`${signed}${Math.round(value).toLocaleString("en-US")}`, 12);
      }),
    );
    const numbers = widest + 6 <= step;
    spec.layer = spec.layer.filter((layer) => !isText(layer) || (numbers && !inside(layer)));
    // Flint pads the value axis for the labels from levels that add the end total to the sum it closes, so it runs
    // to twice the top and below zero. The levels here stop at the end total, and only a side with a label is padded.
    const levels = [0];
    for (const [index, row] of chart.rows.entries()) {
      const value = values[index];
      const last = levels.at(-1)!;
      levels.push(
        index === chart.rows.length - 1 && index > 0 && finalIsTotal ? last : last + value,
      );
    }
    const [low, high] = [Math.min(...levels), Math.max(...levels)];
    const pad = numbers ? (high - low || 1) * 0.08 : 0;
    for (const layer of spec.layer) {
      if (!("encoding" in layer) || !layer.encoding) continue;
      const { y } = layer.encoding;
      if (y && "field" in y && y.field === "__wf_prev_sum")
        layer.encoding.y = {
          ...y,
          scale: { domain: [low < 0 ? low - pad : 0, high + pad], nice: true },
        };
      if ("mark" in layer && layer.mark instanceof Object && layer.mark.type === "text") {
        layer.mark = { ...layer.mark, fill: INK.foreground };
        // Flint's inner delta layer has an encoding-level color, which takes
        // precedence over mark.fill. Remove it so all values use the theme ink.
        delete layer.encoding.color;
        layer.encoding.text = { field: "__wf_delta_text", type: "nominal" };
      }
    }
  }
  // A line or an area is one shape per series, so marks on them find their points in an invisible layer.
  if (chart.marks.length && (chart.type === "line" || chart.type === "area") && "layer" in spec) {
    const [first] = spec.layer;
    // An area stacks its series, and points only stack when told to.
    if (first && "mark" in first && first.encoding) {
      const encoding = { ...first.encoding };
      if (chart.type === "area" && encoding.y && "field" in encoding.y)
        encoding.y = { ...encoding.y, stack: "zero" };
      spec.layer.push({ mark: { type: "point", opacity: 0 }, encoding });
    }
  }
  const { view, svg } = await render(compile(spec, { logger: quiet }).spec);
  const [, width = "0", height = "0"] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg) ?? [];
  const found = boxes(chart, view, Number(width), Number(height));
  view.finalize();
  return { svg, boxes: found };
}

// The house look, set where a spec leaves it: shadcn/ui's charts, in the inks the stylesheet swaps for the page's.
const SPEC_CONFIG = {
  aria: false,
  font: "sans-serif",
  view: { stroke: null },
  range: { category: [...SERIES] },
  mark: { color: SERIES[0] },
  bar: { cornerRadiusEnd: 4 },
  line: { strokeWidth: 2 },
  axis: {
    domain: false,
    ticks: false,
    grid: true,
    gridColor: INK.border,
    labelColor: INK.muted,
    titleColor: INK.muted,
    labelFontSize: 12,
    titleFontSize: 12,
    titleFontWeight: "normal",
    labelPadding: 8,
    titlePadding: 10,
  },
  axisX: { grid: false },
  legend: { labelColor: INK.muted, titleColor: INK.muted, labelFontSize: 12, titleFontSize: 12 },
  text: { color: INK.foreground, fontSize: 12 },
  title: { color: INK.foreground },
} as const;

// A document's spec may not reach the network or the disk where it's parsed: the table is its only data.
const sealed = vega.loader();
sealed.load = () =>
  Promise.reject(new Error("a chart's spec can't load files or URLs; its data is the table"));
// An empty href loads no image and makes no link.
sealed.sanitize = () => Promise.resolve({ href: "" });

/** Draws a Vega-Lite spec over the chart's table, in the house look wherever the spec sets none. */
export async function drawSpec(chart: SpecChart): Promise<{ svg: string }> {
  const { config, ...rest } = chart.spec;
  // The spec came from JSON, and compile() checks it at runtime and throws on what it can't draw.
  const spec: TopLevelSpec = JSON.parse(
    JSON.stringify({
      background: "transparent",
      padding: PADDING,
      ...rest,
      data: { values: chart.values },
      config: Object.assign({}, SPEC_CONFIG, config),
    }),
  );
  const { view, svg } = await render(compile(spec, { logger: quiet }).spec, sealed);
  view.finalize();
  // A link in the drawing would run whatever URL the spec gives it, `javascript:` included.
  return { svg: svg.replace(/<\/?a\b[^>]*>/g, "") };
}

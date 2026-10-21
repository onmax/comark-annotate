import type { ChartAssemblyInput, ThemeSpec } from "flint-chart";
import { assembleVegaLite } from "flint-chart";
import * as vega from "vega";
import { expressionInterpreter } from "vega-interpreter";
import type { TopLevelSpec } from "vega-lite";
import type { Field } from "vega-lite/types_unstable/channeldef.js";
import type { LayerSpec, UnitSpec } from "vega-lite/types_unstable/spec/index.js";
import { compile } from "vega-lite";
import { INK, SERIES } from "./colors.ts";
import type { Chart, XKind } from "./read.ts";

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
      chartProperties: { dodge: "global" },
    },
    options: { maxColorValues: SERIES.length },
    theme_spec: {
      ...theme,
      ...((crowded || (legend && type === "area")) && {
        dataLabels: { ...theme.dataLabels, show: "never" },
      }),
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
  const [left, top] = view.origin();
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
  spec.padding = { left: 12, right: 12, top: 12, bottom: 12 };
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
  const flat = longest(chart) * 7 + 12 <= step;
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
          ? { labelAngle: 0, labelAlign: "center", labelBaseline: "top", labelLimit: 160 }
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
  };
  // Flint also sets axes and legends on the encodings, which win over the config, so the same rules go there. A
  // waterfall's first step gets room from the axis corner, where its label would meet the value axis's 0.
  for (const unit of units(spec)) {
    if ("mark" in unit && unit.mark instanceof Object && unit.mark.type === "text")
      unit.mark = { ...unit.mark, fontSize: TYPE.labelFontSize };
    if (!("encoding" in unit) || !unit.encoding) continue;
    const { color, x, y } = unit.encoding;
    if (color && "legend" in color && color.legend)
      color.legend = { ...color.legend, columns: legendColumns(chart, layout(chart).width) };
    for (const channel of [x, y])
      if (channel && "axis" in channel && channel.axis)
        channel.axis = {
          ...channel.axis,
          labelPadding: 8,
          labelOverlap: "greedy",
          labelSeparation: 6,
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
  // Vega compiles its expressions with `new Function` unless told to interpret them, and Cloudflare Workers, where
  // documents like these often render, forbid that.
  const view = new View(parse(compile(spec, { logger: quiet }).spec, undefined, { ast: true }), {
    renderer: "none",
    logLevel: None,
    expr: expressionInterpreter,
  });
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
  const [, width = "0", height = "0"] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg) ?? [];
  const found = boxes(chart, view, Number(width), Number(height));
  view.finalize();
  return { svg, boxes: found };
}

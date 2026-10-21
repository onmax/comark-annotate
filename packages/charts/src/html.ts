import type { ElementNode, NodeHandler } from "comark";
import { annotateHtml } from "comark-annotate/html";
import { escapeHtml } from "comark/utils";
import type { draw } from "./draw.ts";
import { readChart } from "./read.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { Chart, ChartsMeta, ChartType, XKind } from "./index.ts";

// Each render gets a fresh `state.context`, so a document carries the styles once.
const styled = new WeakSet<object>();

const attr = (value: string) => escapeHtml(value, { '"': "&quot;" });

const chart: NodeHandler = async (node, state) => {
  const [, , ...children] = node;
  // The plugin reported this chart's problems already; here they only decide what can be drawn.
  const read = readChart(node, 0, []);
  const table = children.find(
    (child): child is ElementNode => Array.isArray(child) && child[0] === "table",
  );
  if (!read || !table) return state.flow(["div", {}, ...children], state);

  const styles = styled.has(state.context) ? "" : `<style data-comark-charts>${css}</style>`;
  styled.add(state.context);
  const data = await state.one(table, state);
  const title = read.title ? `<figcaption>${escapeHtml(read.title)}</figcaption>` : "";
  let drawn: Awaited<ReturnType<typeof draw>>;
  try {
    // Flint and Vega take hundreds of milliseconds to load, so a document or a lint run with no chart never loads them.
    drawn = await (await import("./draw.ts")).draw(read);
  } catch {
    // Rendering never throws: a chart that can't be drawn still shows its numbers.
    return `${styles}<figure class="cch" data-type="${read.type}">${title}${data}</figure>`;
  }
  const label = read.title || `${read.type} chart of ${read.series.join(", ")} by ${read.x}`;
  const svg = drawn.svg.replace("<svg", `<svg role="img" aria-label="${attr(label)}"`);
  const [, width, height] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg) ?? [];
  const aspect = width && height ? Number(height) / Number(width) : undefined;
  // Marks the chart couldn't place, such as one on an empty cell, are left out rather than drawn in a corner.
  const marks = read.marks.flatMap((mark) => {
    const box = drawn.boxes.get(mark.n);
    return box ? [{ ...mark, ...box }] : [];
  });
  const plot = marks.length
    ? `<div class="cch-plot cch-marked">${await annotateHtml(svg, marks, label, state, ".cch-plot", aspect)}</div>`
    : `<div class="cch-plot">${svg}</div>`;
  return (
    `${styles}<figure class="cch" data-type="${read.type}">${title}${plot}` +
    `<details class="cch-data"><summary>Data</summary>${data}</details></figure>`
  );
};

/** The HTML renderer for `::chart`. Pass it as `components`; it inlines the styles once per document. */
export const components: Record<"chart", NodeHandler> = { chart };

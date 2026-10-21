---
title: comark-charts
description: Charts from a Markdown table, drawn to SVG with no script.
tagline: Write a table and get a chart drawn to SVG, with no script. The table stays under it, so people see the chart and agents read the numbers.
install: pnpm add comark @comark/html comark-charts
---

::examples
:::example{label="Bars"}
```md
::chart{title="Bundle size by package"}
| package | size (kB) |
| --- | --: |
| annotate | 41.2 |
| carousel | 9.8 |
| embed | 12.4 |
| zoom | 18.1 |
| lint | 27.5 |
::
```
:::

:::example{label="Lines"}
```md
::chart{title="Build time, before and after the cache (ms)"}
| month | before | after |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 890 | 622 |
| 2026-06 | 905 | 640 |
| 2026-07 | 960 | 575 |
| 2026-08 | 975 | 590 |
| 2026-09 | 1,030 | 601 |
| 2026-10 | 1,025 | 540 |
::
```
:::

:::example{label="Marked"}
```md
::chart{title="Build time, before and after the cache (ms)"}
| month | before | after |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 890 | 622 |
| 2026-06 | 905 | 640 |
| 2026-07 | 960 | 575 |
| 2026-08 | 975 | 590 |
| 2026-09 | 1,030 | 601 |
| 2026-10 | 1,025 | 540 |
::::annotation{at="2026-07" series="after" mark="circle" color="green"}
The cache lands, and builds drop below 600 ms.
::::
::::annotation{at="2026-09" series="before" mark="none" side="top" color="red"}
The slowest build without it.
::::
::
```
:::

:::example{label="Before / after"}
```md
::chart{type="dumbbell" title="Page speed, before and after the refactor (ms)"}
| metric | before | after |
| --- | --: | --: |
| first paint | 820 | 540 |
| largest paint | 1,450 | 980 |
| time to interactive | 2,100 | 1,320 |
| total blocking | 380 | 160 |
::
```
:::

:::example{label="Waterfall"}
```md
::chart{type="waterfall" title="Bundle size through this release (kB)"}
| step | size |
| --- | --: |
| v0.1 | 412 |
| add charts | 38 |
| drop moment | -24 |
| split zoom | -11 |
| v0.2 | 415 |
::
```
:::
::

The chart's source is a plain Markdown table, so anyone reading the Markdown, a person or an agent, reads the numbers rather than a chart spec. The page shows the chart with the same table under it, folded into **Data**, so a tool that turns the page into text keeps the numbers too. Without the plugin, the table still renders as a table.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import charts, { components } from "comark-charts/html";

const render = createHtmlRenderer({ plugins: [charts()], components });
```

Charts are drawn while rendering, on the server or at build time, by [Flint](https://github.com/microsoft/flint-chart) and [Vega](https://vega.github.io), which the package installs. The parse plugin only checks the table, so it stays light.

## Syntax

```md
::chart{type="line" x="month" y="before, after" title="Build time (ms)"}
| month | before | after |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
::
```

Put one table between `::chart` and `::`: a header row, then one row per bar, point, or step. The first column is x, and every other column is a series of numbers, named by its header. Rows are drawn in table order.

| Prop | What it does |
| --- | --- |
| `type` | The chart type, from the table below. Without it, dates on x make a line and anything else makes bars. |
| `x` | The column along the x axis. Default the first. |
| `y` | The columns to draw, separated by commas. Default every column but `x`. |
| `title` | The chart's caption, and its name for screen readers. |

Cells hold plain numbers, with commas between thousands if you like, such as `1,200`; put units in the header or the title, such as `size (kB)`. x values in the form `2026`, `2026-04`, `2026-04-15`, or an ISO date and time sit on a time axis, and numbers on a number axis, except on bars, steps, and dumbbells, which give each value its own row.

## Chart types

| `type` | Use it for | Table |
| --- | --- | --- |
| `bar` | One or more numbers per name: sizes, counts, timings. | Names, then one column per series. Several series make grouped bars. |
| `stacked` | Parts that add up to a total per name. | Names, then one column per part. |
| `line` | A trend over time or over a number. | Dates or numbers, then one column per series. Each line is labelled at its end. |
| `area` | Totals over time that add up. | Dates, then one column per part, stacked. |
| `scatter` | One measure against another. | Numbers, then one column per series. |
| `dumbbell` | Before and after for several metrics. | Metric names, then two or more columns, such as `before` and `after`. |
| `waterfall` | How changes add up to a total. | The starting total, then each change, negative for a drop, then the end total, all in one column. |
| `pie` | Shares of one whole. | Names, then one column of numbers that aren't negative. |

Bars turn sideways when their labels are long or there are many of them, so file paths and test names stay whole. In a waterfall, the first row is a total, and so is the last when it equals the running sum; the others are changes, green up and red down.

::examples
:::example{label="Sideways bars"}
```md
::chart{title="Slowest tests (s)"}
| test | duration |
| --- | --: |
| e2e/annotate.e2e.ts › copies a zoomed screenshot | 8.4 |
| e2e/zoom.e2e.ts › closes on Escape | 5.1 |
| e2e/carousel.e2e.ts › snaps to the next slide | 4.7 |
| packages/lint/test/cli.test.ts › exits with 1 | 2.2 |
::
```
:::

:::example{label="Grouped"}
```md
::chart{title="Render phases (ms)"}
| phase | v0.1 | v0.2 |
| --- | --: | --: |
| parse | 120 | 80 |
| render | 160 | 102 |
| hydrate | 200 | 124 |
::
```
:::

:::example{label="Stacked"}
```md
::chart{type="stacked" title="Page weight by asset (kB)"}
| page | js | css | images |
| --- | --: | --: | --: |
| home | 120 | 18 | 240 |
| docs | 95 | 22 | 60 |
| blog | 70 | 15 | 180 |
::
```
:::

:::example{label="Area"}
```md
::chart{type="area" title="Lines in the repo (thousands)"}
| month | code | docs |
| --- | --: | --: |
| 2026-06 | 40 | 20 |
| 2026-07 | 46 | 24 |
| 2026-08 | 52 | 28 |
| 2026-09 | 58 | 32 |
| 2026-10 | 64 | 36 |
::
```
:::

:::example{label="Scatter"}
```md
::chart{type="scatter" title="Load time against page size"}
| size (kB) | cold (ms) | warm (ms) |
| --: | --: | --: |
| 40 | 210 | 90 |
| 85 | 320 | 120 |
| 120 | 410 | 150 |
| 200 | 650 | 210 |
| 260 | 760 | 260 |
::
```
:::

:::example{label="Pie"}
```md
::chart{type="pie" title="Renderers in use (%)"}
| renderer | share |
| --- | --: |
| html | 58 |
| vue | 24 |
| react | 12 |
| svelte | 6 |
::
```
:::
::

## Marks

Point at data with [comark-annotate](/annotate/)'s marks: put an `::annotation` inside the chart, after the table, and name the row it marks with `at`, the row's x value as the table writes it. Add `series` to mark one column's value rather than the whole row.

```md
::chart{title="Bundle size by package (kB)"}
| package | size |
| --- | --: |
| annotate | 41.2 |
| zoom | 18.1 |
:::annotation{at="annotate" color="red"}
The largest, with the marks and their notes.
:::
::
```

| Prop | What it does |
| --- | --- |
| `at` | Required. The x value of the row to mark, copied from the table. |
| `series` | The column to mark in that row. Without it, the mark covers every series in the row. |
| `mark`, `color`, `side` | As on a [screenshot](/annotate/#annotation): `box`, `circle`, `underline`, `highlight`, `cross`, `check`, or `none`; a named or hex color; and `left`, `right`, or `top` for a side note with an arrow. |

The renderer finds the shape it draws for that value, a bar, a point, a slice, or a step, and draws the mark around it, so marks stay on their data when the numbers change. Notes are numbered under the chart, as under a screenshot, and a marked chart zooms like one. comark-annotate comes with comark-charts, and checks the marks the same way.

## Guides

### Validation

The plugin checks every chart while parsing and adds the problems to `meta.issues`, so you can reject a document before publishing it:

```ts
import { parseMarkdown } from "comark";
import charts from "comark-charts";

const { meta } = await parseMarkdown(markdown, { plugins: [charts()] });
if (meta.issues.length) throw new Error(meta.issues.join("\n"));
```

Each issue names its chart by its position in the document and says how to fix it:

```txt
`::chart` 2: row 3 has `41 kB` in `size`, which isn't a number. Write the number alone, such as `1200` or `1,200`, and put the unit in the header, such as `size (ms)`.
```

It reports unknown props and types, columns that `x` or `y` name but the table doesn't have, cells that aren't numbers, tables without rows or with unnamed or repeated columns, an x value that appears twice, content besides the table and its annotations, and data that doesn't fit the type: a line or an area of one row, a scatter without numbers on x, a dumbbell with one column, a pie or a waterfall with several, and a pie with a negative number or nothing but zeros.

Annotations are checked too: a missing or unknown `at`, a `series` the chart doesn't draw, and the mark, color, and side, as comark-annotate checks them on screenshots.

Rendering never throws. A cell that isn't a number is left out, a mark it can't place is left out, a type that doesn't fit falls back to the default, a pie or a waterfall draws its first column, and a chart with nothing to draw shows its content as it is. [comark-lint](/lint/) reports the same issues with their line numbers.

### Theming

The styles follow [shadcn/ui](https://ui.shadcn.com) and the shared `--comark-*` tokens, like the other plugins, so a chart switches with the page's dark mode:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-foreground` | `--foreground` | Values and the caption |
| `--comark-muted` | `--muted-foreground` | Axis labels, the **Data** toggle, waterfall totals |
| `--comark-border` | `--border` | Grid lines and the data table's rules |
| `--comark-background` | `--background` | The edges between slices and around points |
| `--comark-font` | `--font-sans` | All text |
| `--comark-chart-1` to `-6` | `--chart-1` to `-6` | Series, in column order |

Without either, series use six colors that read on light and dark pages: blue, orange, green, purple, rose, and yellow. A waterfall's increases and decreases are series 3 and 5.

```css
:root {
  --comark-chart-1: oklch(0.65 0.2 250);
}
```

The rules sit in a `comark` CSS layer, so any plain rule of your own wins. A chart is a card, a `figure.cch` with `data-type`, holding a `figcaption`, the SVG in `.cch-plot`, and the table in `details.cch-data` as its footer. Marks use comark-annotate's styles and colors.

### Size

A chart keeps the size its text was set for, sized to fit its card with room for its labels, rather than stretching to the column, so labels read the same in every chart. Values sit on the marks when they fit; on crowded or stacked bars, or with negative numbers, the value axis reads them instead. Lines name their series at their ends unless the ends sit close together, and then a legend does. No row is ever dropped: a long sideways chart grows taller. A narrower column scrolls it sideways, and print shrinks it to the page. A chart with marks shrinks to fit instead, since its marks sit at percentages of the chart.

### Renderers

Only `@comark/html` has a renderer, `comark-charts/html`, which inlines the styles once per document. Vega draws on the server, and a Vue, React, or Svelte component would ship it to the browser. Charts are static: there are no tooltips, and the **Data** table holds every number.

## Agents

The package ships an agent skill with the table shape for each chart type and how to check the result. Install it from this site:

```sh
npx skills add https://comark.onmax.me
```

Agents read charts without the skill: in the Markdown and in the page, each chart's data is a table.

## Credits

[Flint](https://github.com/microsoft/flint-chart), by Microsoft Research, chooses the axes, scales, labels, and layout from what the data means, and its New York Times theme is the base of the look. [Vega](https://vega.github.io) draws the SVG. [Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders the HTML.

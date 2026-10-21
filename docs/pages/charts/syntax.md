---
title: Syntax
description: The table each chart type reads, and the marks you can draw on a chart.
---

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
| `mark`, `color`, `side` | As on a [screenshot](/annotate/components/#annotation): `box`, `circle`, `underline`, `highlight`, `cross`, `check`, or `none`; a named or hex color; and `left`, `right`, or `top` for a side note with an arrow. |

The renderer finds the shape it draws for that value, a bar, a point, a slice, or a step, and draws the mark around it, so marks stay on their data when the numbers change. Notes are numbered under the chart, as under a screenshot, and a marked chart zooms like one. comark-annotate comes with comark-charts, and checks the marks the same way.

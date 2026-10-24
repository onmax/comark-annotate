---
title: Syntax
description: The table each chart type reads, Vega-Lite specs for any other chart, and the marks you can draw on a chart.
---

```md
::chart{type="line" x="month" y="coffee cups, commits" title="Coffee cups and commits"}
| month | coffee cups | commits |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
::
```

Put one table between `::chart` and `::`, with a header row, then one row per bar, point, or step. The first column is x, and every other column is a series of numbers, named by its header. Rows are drawn in table order.

| Prop | What it does |
| --- | --- |
| `type` | The chart type, from the table below. Without it, dates on x make a line and anything else makes bars. |
| `x` | The column along the x axis. Default the first. |
| `y` | The columns to draw, separated by commas. Default every column but `x`. |
| `title` | The chart's caption, and its name for screen readers. |

Cells hold plain numbers, with commas between thousands if you like, such as `1,200`. Put units in the header or the title, such as `size (kB)`.

x values in the form `2026`, `2026-04`, `2026-04-15`, or an ISO date and time sit on a time axis, and numbers sit on a number axis. Bars, steps, and dumbbells are the exception, and give each value its own row.

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
| `gantt` | Steps or tasks over time, such as a build, a deploy, or a plan. | One row per bar: its name, then where it starts and where it ends, as numbers or dates. See [Gantts](#gantts). |

Bars turn sideways when their labels are long or there are many of them, so file paths and test names stay whole.

In a waterfall, the first row is a total, and so is the last when it equals the running sum. The other rows are changes, green up and red down.

## Gantts

```md
::chart{type="gantt" title="nuxt build, before and after the worker (s)"}
| step | run | start | end |
| --- | --- | --: | --: |
| compile client | before | 0 | 3.7 |
| compile server | before | 3.7 | 7.8 |
| compile client | after | 0 | 3.7 |
| compile server | after | 0.2 | 4.6 |
| ready | after | 4.6 | 4.6 |
::
```

A gantt draws one bar per row, top to bottom in table order. The first column names the bar, and two columns of numbers or of dates say where it starts and where it ends. When the table has other numbers too, such as a duration, name the two with `y`, as in `y="start, end"`.

A column of names, such as a phase, an owner, or a run, colors the bars, one color per name, with a legend over the chart. A task may then repeat in another group, like the same step in two runs. A column of numbers reads as times, so write numbered groups as names, like `shard 1`.

A row that ends where it starts is a milestone, and draws as a diamond. Every other bar prints how long it lasts past its end. For numbers that's the difference, and for dates it's a span in the table's unit, such as `3y`, `2mo`, `7d`, or `1.5h`.

Dates take the forms x does: `2026`, `2026-04`, `2026-04-15`, or an ISO date and time. A time without a zone is UTC, and the axis shows UTC, so the chart reads the same wherever it's drawn.

::examples
:::example{label="Sideways bars"}
```md
::chart{title="Longest review threads (min)"}
| first comment | minutes |
| --- | --: |
| nit: this file uses tabs and the rest of the repo uses spaces | 84 |
| could we call this something other than data2 | 51 |
| why does the deploy script check for pigeons | 47 |
| is the rubber duck in this screenshot load-bearing | 22 |
::
```
:::

:::example{label="Grouped bars"}
```md
::chart{title="Tabs-vs-spaces arguments per month"}
| team | sunny | rainy |
| --- | --: | --: |
| frontend | 12 | 31 |
| backend | 16 | 40 |
| design | 2 | 9 |
::
```
:::

:::example{label="Stacked bars"}
```md
::chart{type="stacked" title="Standup by topic (min)"}
| day | work | weekend | pigeons |
| --- | --: | --: | --: |
| Monday | 4 | 11 | 2 |
| Wednesday | 6 | 1 | 3 |
| Friday | 2 | 14 | 7 |
::
```
:::

:::example{label="Area"}
```md
::chart{type="area" title="Emoji reactions in team chat (hundreds)"}
| month | thumbs up | eyes |
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
::chart{type="scatter" title="Failed deploys against pigeons on the roof (r = 0.99)"}
| pigeons | failed deploys | rollbacks |
| --: | --: | --: |
| 2 | 1 | 0 |
| 5 | 3 | 1 |
| 9 | 4 | 2 |
| 14 | 7 | 3 |
| 21 | 9 | 5 |
::
```
:::

:::example{label="Pie"}
```md
::chart{type="pie" title="Why the build failed, according to the team (%)"}
| reason | share |
| --- | --: |
| the pigeons | 58 |
| cat on the keyboard | 24 |
| it's Friday | 12 |
| the code | 6 |
::
```
:::
::

## Any chart

For a chart the types don't cover, such as a box plot, a heatmap, or error bands, put a [Vega-Lite](https://vega.github.io/vega-lite/) spec after the table in a `vega-lite` block. The table is still its data, so it stays in the page. Each row becomes one data point, with a field per column named by its header.

````md
::chart{title="Latency per request (ms)"}
| endpoint | ms |
| --- | --: |
| /search | 120 |
| /search | 410 |
| /login | 40 |
| /login | 61 |

```vega-lite
{
  "mark": "boxplot",
  "encoding": {
    "x": { "field": "endpoint", "type": "nominal" },
    "y": { "field": "ms", "type": "quantitative" }
  }
}
```
::
````

Leave `data` out of the spec, because the table replaces it. Cells that read as numbers become numbers, empty ones become null, and the rest stay text.

The chart takes the same colors and type as the other charts wherever the spec sets none, and the spec's own `config` wins. `type`, `x`, `y`, and marks don't apply. Name the columns in the spec's `encoding` instead, and draw notes with a `text` or `rule` layer.

The plugin reports a spec that isn't JSON, a `data` it replaced, and a field that's neither a column nor made by a transform. The spec can't load files or URLs, and the plugin drops links in it.

## Marks

Point at data with [comark-annotate](/annotate/)'s marks. Put an `::annotation` inside the chart, after the table, and name the row it marks with `at`, the row's x value as the table writes it. Add `series` to mark one column's value rather than the whole row.

```md
::chart{title="Rubber ducks bought, by team"}
| team | ducks |
| --- | --: |
| backend | 41 |
| frontend | 18 |
:::annotation{at="backend" color="red"}
Bought in bulk after the Tuesday incident.
:::
::
```

| Prop | What it does |
| --- | --- |
| `at` | Required. The x value of the row to mark, copied from the table. |
| `series` | The column to mark in that row. Without it, the mark covers every series in the row. On a gantt, it names the group of the bar instead, for a task that repeats across groups. |
| `mark`, `color`, `side` | As on a [screenshot](/annotate/components/annotation/): `box`, `circle`, `underline`, `highlight`, `cross`, `check`, or `none`; a named or hex color; and `left`, `right`, or `top` for a side note with an arrow. |

The renderer finds the shape it draws for that value, such as a bar, a point, a slice, or a step, and draws the mark around it. Marks stay on their data when the numbers change.

Notes are numbered under the chart, as under a screenshot, and a marked chart zooms like a screenshot. comark-annotate comes with comark-charts, and checks the marks the same way.

---
name: comark-charts
description: Writes charts in Markdown with the comark-charts Comark plugin, as a table inside a `::chart` block, picks the chart type that fits the data, and marks the values that matter. Use when a Markdown document needs a chart, such as bundle sizes, benchmark or build times, before/after metrics, or a trend over time.
---

# Charts from Markdown tables

You write a Markdown table inside `::chart`; comark-charts draws it as an SVG chart and keeps the table under it. People see the chart, and anyone reading the Markdown or the page, an agent included, reads the numbers from the table. So the table is the source of truth: write the real numbers, and name every column so its header labels the chart.

## Write the table

```md
::chart{title="Coffee cups and commits, per month (r = 0.99)"}
| month | coffee cups | commits |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 890 | 640 |
::
```

- The first column is x: one row per bar, point, or step. Every other column is a series of numbers, named by its header.
- Cells hold plain numbers, like `1200` or `1,200`. Put the unit in the header or the title, like `size (kB)` or `Build time (ms)`. A cell that isn't a number is left out and reported.
- Dates on x read as time when they look like `2026`, `2026-04`, `2026-04-15`, or an ISO date and time.
- Close the block with `::`, and keep only the table inside; write explanations above or below it.

Props, all optional: `type` (below), `x` (the x column, default the first), `y` (the columns to draw, comma-separated, default all the others), and `title` (the caption and the chart's name for screen readers). Give every chart a `title` that says what it measures and in what unit.

## Choose the type

| Data | `type` | Table |
| --- | --- | --- |
| One number per name, such as size per package | `bar` (default for names) | names, then one column; long names turn the bars sideways |
| Several numbers per name, compared side by side | `bar` | names, then one column per series |
| Parts that add up to a total per name | `stacked` | names, then one column per part |
| A trend over time | `line` (default for dates) | dates, then one column per series |
| Totals over time that add up | `area` | dates, then one column per part |
| One measure against another | `scatter` | numbers, then one column per series |
| Before and after for several metrics | `dumbbell` | metric names, then a `before` and an `after` column |
| How changes add up to a total | `waterfall` | the start total, each change (negative for a drop), then the end total, in one column |
| Shares of one whole, five or fewer | `pie` | names, then one column of non-negative numbers |

For a before and after of one or two metrics, grouped `bar` reads best; past three, use `dumbbell`. Keep the rows in the order the reader should read them: charts draw them in table order.

## Mark what matters

Point at the value the text talks about with an `::annotation` after the table, the way comark-annotate marks a screenshot. `at` is the row's x value copied from the table; `series` picks one column in that row.

```md
:::annotation{at="2026-07" series="commits" mark="circle" color="green"}
The new espresso machine arrives, and commits pass 700.
:::
```

`mark`, `color`, and `side` work as on screenshots: red for a problem, green for a fix, and `side="top"` with `mark="none"` for the one point that matters most. The renderer finds the bar, point, or slice and draws the mark around it, so there is nothing to measure. Keep it to two or three marks a chart.

## Check it

In a project with comark-charts installed, run `npx lint-comark report.md`. It prints one line per problem, each naming the chart by its position (`` `::chart` 2 ``) and saying how to fix it, and exits with 1 if there are any. Fix every one. In code, the same sentences are in `meta.issues` after `parseMarkdown(markdown, { plugins: [charts()] })`.

When you can render the page, open it and confirm the chart says what your text says: the right type, every series named, and the numbers in the expected order.

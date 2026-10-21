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

## Credits

[Flint](https://github.com/microsoft/flint-chart), by Microsoft Research, chooses the axes, scales, labels, and layout from what the data means, and its New York Times theme is the base of the look. [Vega](https://vega.github.io) draws the SVG. [Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders the HTML.

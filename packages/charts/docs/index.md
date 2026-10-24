---
title: comark-charts
description: Charts from a Markdown table, drawn to SVG with no script.
keywords: graph, plot, bar chart, line chart, pie chart, scatter plot, area chart, gantt, timeline, roadmap, schedule, benchmark, data visualization, dataviz, Vega
tagline: Write a table and get a chart drawn to SVG, with no script. The table stays under it, so people see the chart and agents read the numbers.
install: pnpm add comark @comark/html comark-charts
group: Review blocks
icon: chart-column
blurb: Charts from a Markdown table
credits: 'Laid out by Microsoft Research''s <a href="https://github.com/microsoft/flint-chart">Flint</a> on its New York Times theme, and drawn by <a href="https://vega.github.io">Vega</a>.'
---

::examples
:::example{label="Bars"}
```md
::chart{title="Pigeons on the roof, by weekday"}
| weekday | pigeons (average) |
| --- | --: |
| Monday | 3.2 |
| Tuesday | 4.1 |
| Wednesday | 2.8 |
| Thursday | 6.5 |
| Friday | 14.7 |
::
```
:::

:::example{label="Lines"}
```md
::chart{title="Coffee cups and commits, per month (r = 0.99)"}
| month | coffee cups | commits |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 890 | 640 |
| 2026-06 | 905 | 652 |
| 2026-07 | 960 | 715 |
| 2026-08 | 975 | 720 |
| 2026-09 | 1,030 | 768 |
| 2026-10 | 1,025 | 760 |
::
```
:::

:::example{label="With notes"}
```md
::chart{title="Coffee cups and commits, per month (r = 0.99)"}
| month | coffee cups | commits |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 890 | 640 |
| 2026-06 | 905 | 652 |
| 2026-07 | 960 | 715 |
| 2026-08 | 975 | 720 |
| 2026-09 | 1,030 | 768 |
| 2026-10 | 1,025 | 760 |
::::annotation{at="2026-07" series="commits" mark="circle" color="green"}
The new espresso machine arrives, and commits pass 700.
::::
::::annotation{at="2026-09" series="coffee cups" mark="none" side="top" color="red"}
Peak coffee.
::::
::
```
:::

:::example{label="Before / after"}
```md
::chart{type="dumbbell" title="Minutes lost per week, before and after the rubber ducks"}
| activity | before | after |
| --- | --: | --: |
| waiting for review | 820 | 540 |
| debugging alone | 1,450 | 980 |
| meetings about bugs | 2,100 | 1,320 |
| standup | 380 | 160 |
::
```
:::

:::example{label="Performance"}
```md
::chart{type="dumbbell" title="Largest Contentful Paint per page, before and after lazy-loading the editor (ms)"}
| page | before | after |
| --- | --: | --: |
| home | 2,480 | 1,120 |
| docs | 2,910 | 1,340 |
| blog post | 2,050 | 980 |
| playground | 4,350 | 4,100 |
::::annotation{at="playground" series="after" mark="circle" color="red"}
The playground opens the editor right away, so it stays slow.
::::
::
```
:::

:::example{label="Gantt"}
```md
::chart{type="gantt" title="A Friday deploy, minutes after 16:55"}
| step | start | end |
| --- | --: | --: |
| tests | 0 | 6 |
| build | 6 | 11 |
| deploy | 11 | 13 |
| it's live | 13 | 13 |
| rollback | 21 | 24 |
::
```
:::

:::example{label="Waterfall"}
```md
::chart{type="waterfall" title="Rubber ducks in the office this quarter"}
| step | ducks |
| --- | --: |
| July | 41 |
| bulk order | 12 |
| taken home | -4 |
| behind the radiator | -3 |
| October | 46 |
::
```
:::
::

The chart's source is a plain Markdown table. A person or an agent reading the Markdown reads the numbers, not a chart spec. The page shows the chart with the same table under it, folded into **Data**, so a tool that turns the page into text keeps the numbers too. Without the plugin, the table still renders as a table.

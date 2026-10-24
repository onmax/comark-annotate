---
title: comark-metrics
description: Before and after numbers, progress, and tables of metrics, written in Markdown.
keywords: KPI, stats, statistics, numbers, delta, change, percent, progress bar, performance, benchmark, bundle size, comparison table
tagline: Write two numbers and get the arrow, the percent change, and whether it's better or worse. Wrap a table of befores and afters and get its change column, or a tile for each.
install: pnpm add comark @comark/html comark-metrics
group: Review blocks
icon: trending-down
blurb: Deltas, progress, stats, and tiles
credits: 'After <a href="https://quarto.org/docs/dashboards/data-display.html#value-boxes">Quarto</a>''s value boxes, <a href="https://docs.evidence.dev/components/data/delta">Evidence</a>''s delta, and <a href="https://facelessuser.github.io/pymdown-extensions/extensions/progressbar/">PyMdown</a>''s progress bars.'
---

::examples
:::example{label="Delta"}
```md
Moving the pigeon map to a worker cut the main bundle :delta{from=412 to=388 unit="kB" better="lower"} and the time to first sighting :delta{from=2.4 to=1.9 unit="s" better="lower"} on a mid-range phone
```
:::

:::example{label="Stats"}
```md
::stats{better="lower"}
| Metric | Before | After |
| --- | --- | --- |
| JavaScript | 412 kB | 388 kB |
| Largest paint | 2.4 s | 1.9 s |
| Requests | 38 | 41 |
::
```
:::

:::example{label="Tiles"}
```md
::stats{tiles better="lower"}
| Metric | Before | After |
| --- | --- | --- |
| JavaScript | 412 kB | 388 kB |
| Largest paint | 2.4 s | 1.9 s |
| Requests | 38 | 41 |
::
```
:::

:::example{label="Progress"}
```md
Duck tests moved to Vitest: :progress{value=0.85 label="Migrated"}
```
:::
::

A pull request that changes a size or a speed reads best with the numbers next to the claim. The plugin works out the change while parsing, so every renderer only draws it, and the output needs no script.

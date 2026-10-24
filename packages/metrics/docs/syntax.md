---
title: Syntax
description: The props of delta, progress, stats, and stat tiles.
---

## Delta

```md
:delta{from=412 to=388 unit="kB" better="lower"}
```

Shows `412 kB → 388 kB ↓ 5.8%`. The change is green when it's better and red when it's worse.

| Prop | What it does |
| --- | --- |
| `from` | Required. The number before. |
| `to` | Required. The number after. |
| `unit` | Written after both numbers, such as `kB`, `s`, or `%`. |
| `better` | `lower` for sizes and durations, `higher` for scores. Without it, the change is gray. |

The change is a percent of `from`. When `from` is 0 there is no percent, so it shows the difference instead, such as `↑ 1.5 s`.

## Progress

```md
:progress{value=0.85 label="Migrated"}
:progress{value=17 max=20}
```

A native `<progress>` with its percent after it.

| Prop | What it does |
| --- | --- |
| `value` | Required. A fraction from 0 to 1, or a count up to `max`. |
| `max` | What `value` counts up to. Default 1. |
| `label` | Shown before the bar, and names it for screen readers. |

A raw `<progress>` in the Markdown stays as written.

## Stats

```md
::stats{better="lower"}
| Metric | Before | After |
| --- | --- | --- |
| JavaScript | 412 kB | 388 kB |
| Requests | 38 | 41 |
::
```

The table needs three columns: a name, the value before, and the value after. The plugin adds a Change column with each row's arrow and percent, colored by `better`, and aligns the numbers. A cell is a number, with commas if you like, and an optional unit after it; both cells of a row need the same unit. Name the headers what you like.

| Prop | What it does |
| --- | --- |
| `better` | `lower` or `higher`, for every row. |
| `unit` | The unit of a difference from 0, for cells written without one. |
| `tiles` | Shows each row as a tile instead of a table row. |

### Tiles

```md
::stats{tiles better="lower"}
| Metric | Before | After |
| --- | --- | --- |
| JavaScript | 412 kB | 388 kB |
| Largest paint | 2.4 s | 1.9 s |
::
```

With `tiles`, each row becomes a tile: the after value large, the metric's name above it, and the change under it in a pill colored by `better`. The before value is read for the change and not shown. The tiles wrap to fit the width.

A table of two columns, a name and a value, makes tiles with no change. A value can be any text:

```md
::stats{tiles}
| Metric | Value |
| --- | --- |
| Tests | 1,204 |
| Coverage | 92% |
| Status | Passing |
::
```

The tiles are a `<dl>`, so they read as name and value pairs with no styles and no script.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a missing or unreadable number, a `better` that isn't `lower` or `higher`, a `value` outside 0 to `max`, a `::stats` without a table or with other than three columns (two or three with `tiles`), a row whose cells aren't numbers or are in different units, and a prop a block doesn't read. Each issue names its block and says how to fix it, and each has its own rule in [Doctor](/doctor/):

```txt
`:progress` 1: `value=85` is outside 0 to 1, so the bar was clamped. Write a fraction such as `value=0.85`, or set `max=100`.
`::stats` 1, row "Size": before is in MB and after in kB. Write both in the same unit.
```

---
title: Theming
description: The colors of better and worse, the progress bar, and the classes of deltas, tables, and tiles.
---

A delta's change is green when it's better, red when it's worse, and muted when there's no verdict. A progress bar follows shadcn/ui's Progress: the primary color on a track of itself. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Deltas, bars, tables, and tiles read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-foreground` | The progress bar, when the page has no `--primary`, and a tile's value |
| `--comark-muted` | The value before, a change with no verdict, a bar's label and percent, a tile's name |
| `--comark-background` | A tile |
| `--comark-border` | A tile's border |
| `--comark-radius` | A tile's corners, 2px rounder |
| `--comark-font` | Inherited text, with tabular numbers |

## Variables

| Variable | Default | Used for |
| --- | --- | --- |
| `--cmt-better` | `#259f56`, `#59d38c` in dark mode | A change that's better |
| `--cmt-worse` | shadcn/ui's `--destructive`, else `#ee3533`, `#fd736d` in dark mode | A change that's worse |
| `--cmt-bar` | shadcn/ui's `--primary`, else `--comark-foreground` | The progress bar's fill, and its track at 20% |

Set `--cmt-better` and `--cmt-worse` on `.cmt-delta`, and `--cmt-bar` on `.cmt-progress`.

## Classes

| Class | Element |
| --- | --- |
| `.cmt-delta` | A delta, with `data-direction` (`up`, `down`, `same`) and `data-verdict` (`better`, `worse`, `neutral`) |
| `.cmt-from`, `.cmt-to`, `.cmt-change` | Its value before, after, and the arrow with the percent |
| `.cmt-progress` | A progress bar, with `.cmt-label` before it and `.cmt-percent` after |
| `.cmt-stats` | A `::stats` table |
| `.cmt-tiles` | A `::stats{tiles}` grid, a `<dl>` |
| `.cmt-tile`, `.cmt-value` | Each tile, a `<div>` of its `<dt>` name, its `<dd>` value, and a `<dd>` with its delta |

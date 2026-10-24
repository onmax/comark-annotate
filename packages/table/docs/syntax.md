---
title: Syntax
description: Files, fences, and the props of a table.
---

## Files

```md
::table{src="bench/results.csv" sort}
::
```

`src` is a path relative to the document's folder, or to `root` when it starts with `/`. It can't leave `root` or be a URL. The extension picks the format: `.csv`, `.tsv`, or `.json`; set `format` for a file named otherwise.

## Fences

A ` ```csv ` or ` ```tsv ` fence becomes a table wherever it is. Pass `fences: false` to keep them as code.

A ` ```json ` fence stays code, since most JSON in a document is an example. Put it inside `::table` to make it a table:

````md
::table
```json
[{ "bird": "Mallard", "seen": 14 }, { "bird": "Heron", "seen": 2 }]
```
::
````

`::table` around a Markdown table gives it the copy buttons and `sort`.

## Formats

| Format | Reads |
| --- | --- |
| CSV | Comma-separated, as RFC 4180 writes it: a cell in double quotes may hold commas and line breaks, and `""` is a quote. |
| TSV | Tab-separated, with no quoting. |
| JSON | An array of objects, one per row. Every key becomes a column, in the order first seen; a nested value is written as JSON. |

The first row of CSV and TSV is the header. A column whose cells are all numbers, with commas and a short unit if you like, lines up on the right.

## Props

| Prop | What it does |
| --- | --- |
| `src` | A CSV, TSV, or JSON file to read. |
| `format` | `csv`, `tsv`, or `json`, when the extension or the fence doesn't say. |
| `sort` | Makes every header a button that sorts the rows, up then down. Numbers sort as numbers. |
| `copy` | `copy=false` hides the Copy CSV and Copy Markdown buttons. |

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a file that's missing, outside the root, a URL, or in a format it can't read; JSON that doesn't parse or isn't an array of objects; a quote that never closes; a row with too few or too many cells; and a `::table` with nothing in it. A fence it can't read stays code, and a prop it doesn't read is reported too. Each issue names its table and says how to fix it, and each has its own rule in [Doctor](/doctor/):

```txt
`::table` 1 ("bench.csv"): file not found. It resolved to "guide/bench.csv" under the root; check the path or `base`.
The ```csv fence 1: row 3 has 4 cells, but the header has 3. Give every row one cell per column.
```

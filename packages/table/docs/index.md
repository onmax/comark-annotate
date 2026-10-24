---
title: comark-table
description: Tables from CSV, TSV, and JSON, read while parsing, that copy and sort.
keywords: CSV, TSV, JSON, data table, sortable table, sort, spreadsheet, Excel, copy table, datagrid
tagline: Point a table at a CSV file, or paste the CSV into a fence, and get a table with Copy CSV and Copy Markdown buttons and, if you like, headers that sort.
install: pnpm add comark @comark/html comark-table
group: Review blocks
icon: table
blurb: Tables from CSV and JSON
credits: 'After <a href="https://mystmd.org/guide/tables#csv-tables">MyST</a>''s csv-table, <a href="https://docs.gitlab.com/user/markdown/#json-tables">GitLab</a>''s JSON tables, and <a href="https://streamdown.ai">Streamdown</a>''s table copy.'
---

::examples
:::example{label="CSV fence"}
````md
```csv
Benchmark,Before (ms),After (ms)
Parse the duck census,"1,204",980
Render the pond map,88,91
Count the pigeons,412,388
```
````
:::

:::example{label="Sortable"}
````md
::table{sort}
```json
[
  { "bird": "Mallard", "seen": 14, "pond": "North" },
  { "bird": "Pigeon", "seen": 212, "pond": "Plaza" },
  { "bird": "Heron", "seen": 2, "pond": "North" }
]
```
::
````
:::
::

A benchmark or an export reads best as the table it is, and an agent writing a review shouldn't have to turn CSV into Markdown by hand. The plugin reads the file or the fence while parsing, so the table is plain HTML. A small script adds the copy buttons and sorting, and without it the table still reads.

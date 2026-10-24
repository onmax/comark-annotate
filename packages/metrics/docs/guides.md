---
title: Guides
description: Benchmarks in a pull request, and tables where better differs by row.
---

## Benchmarks in a pull request

Put the numbers where the claim is. A sentence that says what changed carries a `:delta`, and a table of every measurement goes in `::stats` under it:

```md
Moving the map to a worker cut the main bundle :delta{from=412 to=388 unit="kB" better="lower"} on every page

::stats{better="lower"}
| Metric | Before | After |
| --- | --- | --- |
| JavaScript | 412 kB | 388 kB |
| Largest paint | 2.4 s | 1.9 s |
::
```

Copy the numbers from the tool's output as it prints them: `1,204` and `2.4 s` both read.

## Where better differs by row

`better` applies to the whole table. When some rows are better lower, such as sizes, and others better higher, such as scores, write two tables, one for each.

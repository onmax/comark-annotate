---
title: Guides
description: Benchmark results in a pull request, big tables, and reading files.
---

## Benchmarks in a pull request

Have the benchmark write CSV next to the document, and point a table at it, so the numbers in the review are the ones the run produced:

```md
::table{src="./bench/results.csv" sort}
::
```

## Big tables

Every row becomes HTML, so a table of thousands of rows makes a heavy page. Trim the data to the rows a reader needs before writing it. A table wider than the page scrolls sideways inside its frame.

## Reading files

Files are read while parsing, the way [comark-include](/include/) reads them: from disk under `root` by default, refusing symlinks that lead out of it, or through your `read`. The table doesn't fetch URLs; download the data first.

## Without the script

The copy buttons and the sort arrows only show once the script runs. Without it, the headers read as plain text and the table is still a table. In print, the buttons are hidden.

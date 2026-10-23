---
title: Syntax
description: How a tree is written, and the issues it reports.
---

````md
::file-tree
```
src/
  + new.ts  # added in this change
  - old.ts
  ~ app.vue
  ...
README.md
```
::
````

Write one entry per line in a fenced block inside `::file-tree`. Any language, or none, works.

| Written | What it does |
| --- | --- |
| Two spaces before a name | Puts it inside the entry above that starts further left. Four spaces, or tabs, work the same. |
| `├──`, `└──`, `│` | Output pasted from `tree`, in Unicode or ASCII. Its `.` root and `3 directories, 5 files` summary are dropped. |
| A trailing `/` | Makes a folder. An entry with entries under it is a folder too, as `tree` prints them. |
| `+`, `-`, `~` and a space before a name | Marks it added, removed, or changed: a color, and the sign kept beside the name. |
| ` # ` and text after a name | A note, shown after it in a lighter color. A `#` that starts a name, as in `#notes.md`, is part of the name. |
| `...` | A placeholder for entries left out. |

## Why a fenced block

Starlight writes its file tree as a Markdown list, but in Comark a list mangles names. `__init__.py` turns bold, `[id].vue` becomes a span, and a `- #notes.md` line opens a slot that swallows every entry after it. Inside a fence, every character stays.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A Markdown list instead of a fence renders as the list, with the fix: write the tree in a fenced block.
- Content beside the fence doesn't render.
- An empty fence, or a block with nothing in it.
- A prop, which the block doesn't read.

Each issue names its block and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

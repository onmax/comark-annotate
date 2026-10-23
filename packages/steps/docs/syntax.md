---
title: Syntax
description: Steps from headings or from a numbered list, and the issues they report.
---

## Headings

```md
::steps{level="2"}
## Install
Run `pnpm add comark-steps`.

## Register
Pass `steps()` to the parser.
::
```

| Prop | What it does |
| --- | --- |
| `level` | The level of the headings that start each step, from 2 to 6. Defaults to 3, so `###` headings. Deeper headings stay inside their step. |

This is Nuxt UI's `::steps`, unchanged, so a page renders the same steps under Nuxt UI.

## A numbered list

```md
::steps
3. Open a pull request.
4. Wait for review.
::
```

A block whose only content is a numbered list makes one step of each item, as Starlight's `<Steps>` does. A list that starts past 1 keeps its number.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- Content before the first heading renders above the steps.
- A block with no headings at its `level` and no numbered list renders as plain content. When its headings are at another level, the issue names the `level` to write.
- A `level` outside 2 to 6 falls back to 3.

Each issue names its block and says how to fix it.

---
title: Guides
description: Anchors, nested steps, the node it writes, and theming.
---

## Anchors and the table of contents

The heading that starts a step stays a heading inside it, with the same `id`, so `#install` links, a table of contents built from the document, and comark-linter's anchor check all see it as before.

## Steps inside a step

A `:::steps` inside a step keeps its own headings and its own numbers:

::example
```md
::steps
### Set up the database
:::steps{level="4"}
#### Start Postgres
#### Run the migrations
:::

### Start the server
Run `pnpm dev`.
::
```
::

## Your own renderer

The parse plugin replaces the block with a `steps` node holding one `step` per step, and writes each step's number as `index`, counted from the list's `start`:

```json
["steps", { "start": "3" }, ["step", { "index": "3" }, "Open a pull request."]]
```

`start` is there only when the steps start past 1. A component for `step` gets everything after the heading as its content, the heading included.

## Theming

Steps are an `<ol class="cs">` of `<li class="cs-step">`, numbered with the CSS counter `cs-step` in a circle on `::before`, and joined by a line on `::after`. They read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-foreground` | The numbers |
| `--comark-border` | The circles and the line |
| `--comark-accent` | Inside the circles |
| `--comark-font` | The numbers |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

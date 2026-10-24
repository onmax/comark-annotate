---
title: comark-details
description: Details, accordions, and collapsibles, written in Markdown.
keywords: accordion, collapsible, collapse, expand, fold, spoiler, toggle, summary, disclosure, FAQ
tagline: Fold away the answer, the long log, or the optional props behind a summary that opens with no script. Nuxt UI's syntax, drawn as native details.
install: pnpm add comark @comark/html comark-details
group: Docs blocks
icon: list-collapse
blurb: Details and accordions
credits: 'Syntax from <a href="https://ui.nuxt.com/docs/typography">Nuxt UI</a>''s prose accordion and collapsible.'
---

::examples
:::example{label="Details"}
```md
::details{summary="Why does the build need Node 22?"}
`node:sqlite` caches the icons between builds, and it shipped in Node 22.5.
::
```
:::

:::example{label="Accordion"}
```md
::accordion{type="single" :defaultValue='["0"]'}
:::accordion-item{label="Is it free?" icon="lucide:badge-dollar-sign"}
Yes. Every package is MIT licensed.
:::

:::accordion-item{label="Does it need a script?" icon="lucide:code"}
No. Each item is a native `<details>`, and `type="single"` gives them one `name`, so opening one closes the others.
:::
::
```
:::

:::example{label="Collapsible"}
```md
::collapsible{name="options"}
- `level`: the heading level that starts each step.
- `start`: the number of the first step.
::
```
:::
::

Everything renders as `<details>` with a real `<summary>`, so it opens and closes, finds with the browser's search, and prints, all without a script. Comark alone writes a `#summary` slot as a `<template>`, which browsers never show.

---
title: comark-cards
description: Cards, link cards, and columns, written in Markdown.
keywords: card grid, grid, layout, tiles, see also, next steps
tagline: Point readers to the next page with link cards, and set blocks side by side in columns. Nuxt UI's syntax, with no script.
install: pnpm add comark @comark/html comark-cards
group: Docs blocks
icon: layout-grid
blurb: Cards and columns
credits: 'Syntax from <a href="https://ui.nuxt.com/docs/typography">Nuxt UI</a>''s prose cards.'
---

::examples
:::example{label="Link cards"}
```md
::card-group
:::card{title="Renderers" icon="lucide:rocket" to="/guide/renderers/"}
Render with HTML, Vue, React, or Svelte.
:::

:::card{title="Source on GitHub" icon="lucide:github" to="https://github.com/onmax/comark-ui" color="neutral"}
Read the code, or open an issue.
:::
::
```
:::

:::example{label="Columns"}
```md
::columns{cols="2"}
:::column
**Before**

One long page of options.
:::

:::column
**After**

Each option under its own heading.
:::
::
```
:::
:::example{label="States"}
```md
::card-group
:::card{title="Failing" color="error" variant="soft" icon="lucide:circle-x"}
`upload.test.ts` times out on files over 10 MB.
:::

:::card{title="Passing" color="success" variant="soft" icon="lucide:circle-check"}
Every other test passes.
:::
::
```
:::
::

A link card is one link that covers the card, named after its title, so a click anywhere opens it and a screen reader hears one link, not a card's worth of text. Links in the card's own text still work.

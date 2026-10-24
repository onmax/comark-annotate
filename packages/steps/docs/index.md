---
title: comark-steps
description: Numbered steps, written in Markdown.
keywords: tutorial, procedure, numbered list, walkthrough, how-to, stepper, timeline
tagline: Turn the headings of a tutorial, or a numbered list, into numbered steps down a line. Nuxt UI's syntax, with no script.
install: pnpm add comark @comark/html comark-steps
group: Docs blocks
icon: list-ordered
blurb: Numbered steps
credits: 'Syntax from <a href="https://ui.nuxt.com/docs/typography">Nuxt UI</a>''s prose steps, and the numbered-list form from <a href="https://starlight.astro.build/components/steps/">Starlight</a>.'
---

::examples
:::example{label="Headings"}
````md
::steps
### Install the plugin
```sh
pnpm add comark-steps
```

### Register it
Pass `steps()` to the parser and `components` to the renderer.

### Write the steps
Wrap the headings of a tutorial in `::steps`.
::
````
:::

:::example{label="Numbered list"}
```md
::steps
1. Fork the repository and clone it.
2. Run `pnpm install`.
3. Open a pull request against `main`.
::
```
:::
::

Each heading starts a step that holds everything up to the next one. The heading keeps its `id`, so links to it and the page's table of contents still work. Without the styles, the steps read as a numbered list.

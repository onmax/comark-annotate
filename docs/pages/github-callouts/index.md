---
title: comark-github-callouts
description: GitHub's alerts as callouts with an icon and a title, written in Markdown.
tagline: Write > [!NOTE] through > [!CAUTION] as on GitHub, and get a shadcn-style callout on any page.
install: pnpm add comark @comark/html comark-github-callouts
---

::examples
:::example{label="Types"}
```md
> [!NOTE]
> Drafts save every few seconds, so closing the tab keeps your work.

> [!TIP]
> Press ⌘K to search every document.

> [!IMPORTANT]
> Releases ship from `main` only.

> [!WARNING]
> Changing the slug breaks links people already shared.

> [!CAUTION]
> Deleting a folder deletes every document in it.
```
:::

:::example{label="Custom title"}
```md
> [!IMPORTANT] Decision
> Keep the existing endpoint. Clients pin its response shape.
```
:::

:::example{label="Any content"}
```md
> [!WARNING] Breaking change in v2
> The `render` option moved:
>
> - `render(markdown)` is now `createHtmlRenderer()(markdown)`
> - `components` keys are tag names
>
> ```ts
> const render = createHtmlRenderer({ plugins, components });
> ```
```
:::
::

The five types are GitHub's. Each gets its icon, its color, and its title; the text after the marker on its line replaces the title.

Comark's built-in [alert plugin](https://comark.dev/plugins/defaults/alert) already reads these markers: it tags the quote with its type and leaves the drawing to you. Use this package when you want them drawn: the icon, the title, and the styles in every renderer, plus a title written on the marker's line and configurable default titles.

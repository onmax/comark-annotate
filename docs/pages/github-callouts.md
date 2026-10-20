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

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import githubCallouts, { components } from "comark-github-callouts/html";

const render = createHtmlRenderer({ plugins: [githubCallouts()], components });
```

The plugin is named `alert`, so it takes the place of Comark's built-in alert plugin, and works with `registerDefaultPlugins: false` too. A quote without a marker, or with a type GitHub doesn't have, stays a quote.

`githubCallouts({ titles: { note: "Nota", warning: "Aviso" } })` changes the default titles, for a site in another language.

For Vue, React, or Svelte, import from `comark-github-callouts/vue`, `comark-github-callouts/react`, or `comark-github-callouts/svelte`; the components add the styles when they mount. Import `comark-github-callouts/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Syntax

```md
> [!TYPE] Optional title
> The body: any Markdown, over as many lines as it needs.
```

| Type | Use it for |
| --- | --- |
| `NOTE` | Context the reader should know, even when skimming |
| `TIP` | A better or faster way to do something |
| `IMPORTANT` | Something the reader needs to succeed |
| `WARNING` | A risk that needs their attention now |
| `CAUTION` | An action with consequences they can't undo |

The marker is case-insensitive. Callouts work inside lists and other blocks.

## Guides

### Theming

Callouts follow shadcn/ui's Alert and the shared tokens in [Theming](/guide/theming/), and read shadcn's `--destructive` for `CAUTION`. Set `--cgc-note`, `--cgc-tip`, `--cgc-important`, `--cgc-warning`, or `--cgc-caution` to recolor one type:

```css
.cgc {
  --cgc-note: oklch(0.55 0.2 260);
}
```

A callout is a `.cgc` with `data-type`, holding `.cgc-icon`, `.cgc-title`, and `.cgc-body`.

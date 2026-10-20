---
title: comark-tabs
description: Tabs and code groups, written in Markdown.
tagline: Tabs of any content, and code blocks grouped by package manager or language, that switch together across the page.
install: pnpm add comark @comark/html comark-tabs
---

::examples
:::example{label="Tabs"}
```md
::tabs{sync="os"}
:::tabs-item{label="macOS"}
Press **⌘K** to search.
:::

:::tabs-item{label="Windows"}
Press **Ctrl+K** to search.
:::
::
```
:::

:::example{label="Code group"}
````md
::code-group{sync="pm"}
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```

```sh [yarn]
yarn add comark-tabs
```
::
````
:::
::

Without a script, every tab shows under its label, one after another. The script adds the tab strip, the arrow keys, and `sync`, which switches every block with the same key at once and remembers the choice.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import tabs, { components } from "comark-tabs/html";

const render = createHtmlRenderer({ plugins: [tabs()], components });
```

## Components

### tabs

Each `:::tabs-item` inside `::tabs` is a tab, named by its `label`.

::example
```md
::tabs
:::tabs-item{label="Preview"}
The rendered page.
:::

:::tabs-item{label="Source"}
The Markdown behind it.
:::
::
```
::

| Prop | |
| --- | --- |
| `sync` | A key shared by blocks that switch together. Picking a tab picks the tab with the same label in every block with that key, now and on the next visit. |

### tabs-item

One tab. It holds any Markdown, even other tabs.

| Prop | |
| --- | --- |
| `label` | The tab's name, required. Labels in one block must differ. |

### code-group

Code blocks as tabs, each named by the label in brackets after its language. The label becomes the tab, so the code block doesn't repeat it, and the tabs sit in a header joined to the block. Without a script, each block keeps its label as a header of its own.

::example
````md
::code-group{sync="pm"}
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```
::
````
::

| Prop | |
| --- | --- |
| `sync` | As on `::tabs`. A code group and tabs with the same key switch together. |

## Guides

### Keys

The tabs follow the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Tab moves focus into the strip and on to the open panel. The left and right arrow keys move between tabs and open them, wrapping at the ends and following the reading direction, and Home and End go to the first and last tab.

### Sync

Blocks with the same `sync` switch together by label, so `::code-group{sync="pm"}` on every install snippet keeps the reader's package manager. The choice is saved in `localStorage` under `comark-tabs:` and the key, and restored on the next page that uses it. When a switch changes the height of blocks above the one the reader clicked, the page scrolls by as much, so the tab stays under the pointer.

### Validation

The plugin checks every block while parsing and adds the problems to `meta.issues`, so you can reject a document before publishing it.

```ts
import { parseMarkdown } from "comark";
import tabs from "comark-tabs";

const { meta } = await parseMarkdown(markdown, { plugins: [tabs()] });
if (meta.issues.length) throw new Error(meta.issues.join("\n"));
```

Each issue names its block and says how to fix it:

```txt
`::code-group` 1, block 2: a code block needs a label. Put it in brackets after the language: ```bash [npm].
```

It reports a tab without a label, two tabs with the same label, content outside every tab (it doesn't render), anything but code blocks in a code group, a block with no tabs, and a `:::tabs-item` outside `::tabs` (it renders as plain content). Rendering never throws.

### Zoom

Images in tabs zoom with [comark-zoom](/zoom) like any other image. A gallery or zoom group only pages through what's shown, so images in closed tabs stay out of it.

### Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-tabs/html` inlines the styles and script once per document |
| `@comark/vue` | `comark-tabs/vue` |
| `@comark/react` | `comark-tabs/react` |
| `@comark/svelte` | `comark-tabs/svelte`, Svelte 5.20 or later |

Import `comark-tabs/style.css` with your styles when you render on a server.

### Theming

The tab strip is a segmented control in the style of shadcn/ui, on the same `--comark-*` tokens as the other plugins: `--comark-border` frames it, `--comark-accent` tints it, the open tab sits on `--comark-background`, the others use `--comark-muted`, and `--comark-ring` marks focus. `--comark-radius` rounds the strip, and the tabs inside it a little less. See [Theming](/carousel/#guides-theming) for the full list and the Nuxt UI mapping.

The rules sit in a `comark` CSS layer, so any plain rule of your own wins, such as `.ct-tab { border-radius: 0 }`. One rule sits outside it: pages style code blocks with plain rules, so the rule that drops a code group's block margin and top corners, to join it to its header, has to beat them.

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders it. The syntax follows [Nuxt UI](https://ui.nuxt.com)'s tabs and code groups.

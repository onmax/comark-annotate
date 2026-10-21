---
title: Guides
description: Keys, tabs that sync across a page, icons, validation, zoom, and theming.
---

## Keys

The tabs follow the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Tab moves focus into the strip and on to the open panel. The left and right arrow keys move between tabs and open them, wrapping at the ends and following the reading direction, and Home and End go to the first and last tab.

## Sync

Blocks with the same `sync` switch together by label, so `::code-group{sync="pm"}` on every install snippet keeps the reader's package manager. The choice is saved in `localStorage` under `comark-tabs:` and the key, and restored on the next page that uses it. When a switch changes the height of blocks above the one the reader clicked, the page scrolls by as much, so the tab stays under the pointer.

## Icons

Give a tab an `icon`: an Iconify name, such as `lucide:apple` or `logos:pnpm`, or the URL of an image. [comark-icon](/icon/) resolves it while parsing and draws it, so it shows before the label in the strip and without the script, and looks and sizes like an `:icon`.

::example
```md
::tabs
:::tabs-item{label="macOS" icon="lucide:apple"}
Press **⌘K** to search.
:::

:::tabs-item{label="Windows" icon="lucide:monitor"}
Press **Ctrl+K** to search.
:::
::
```
::

Set icons once for every block with `icons`, by label, for tabs that don't set their own. Icons come from the Iconify API by default; pass the resolver the page's `:icon` uses as `iconResolver`, so they share its sets and `fetch`:

```ts
import { icons as logos } from "@iconify-json/logos";
import icon, { createIcons } from "comark-icon/html";
import tabs from "comark-tabs/html";

const icons = createIcons({ collections: { logos } });
const plugins = [
  icon(icons),
  tabs({ iconResolver: icons, icons: { pnpm: "logos:pnpm", npm: "logos:npm-icon" } }),
];
```

Size them with `--comark-icon-size`, and style them as [comark-icon's syntax](/icon/syntax/#styling) describes.

## Validation

The plugin adds a problem with any block to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
`::code-group` 1, block 2: a code block needs a label. Put it in brackets after the language: ```bash [npm].
```

It reports a tab without a label, two tabs with the same label, an icon it can't draw (in comark-icon's words), content outside every tab (it doesn't render), anything but code blocks in a code group, a block with no tabs, and a `:::tabs-item` outside `::tabs` (it renders as plain content). Rendering never throws.

## Zoom

Images in tabs zoom with [comark-zoom](/zoom) like any other image. A gallery or zoom group only pages through what's shown, so images in closed tabs stay out of it.

## Theming

The tab strip is a segmented control in the style of shadcn/ui, on the shared tokens in [Theming](/guide/theming/): `--comark-border` frames it, `--comark-accent` tints it, the open tab sits on `--comark-background`, and the others use `--comark-muted`. One rule sits outside the `comark` layer: pages style code blocks with plain rules, so the rule that drops a code group's block margin and top corners, to join it to its header, has to beat them.

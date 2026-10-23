---
title: Guides
description: Keys, tabs that sync across a page, package managers, icons, validation, and zoom.
---

## Keys

The tabs follow the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Tab moves focus into the strip and on to the open panel. The left and right arrow keys move between tabs and open them. They wrap at the ends and follow the reading direction. Home and End go to the first and last tab.

## Sync

Blocks with the same `sync` switch together by label, so `::code-group{sync="pm"}` on every install snippet keeps the reader's package manager. The script saves the choice in `localStorage` under `comark-tabs:` and the key, and restores it on the next page that uses it.

When a switch changes the height of blocks above the one the reader clicked, the page scrolls by as much, so the tab stays under the pointer.

## Package managers

A code block marked `npm2yarn` gets a tab for npm, pnpm, yarn, and bun, in that order. Set others, in the order you want, with `managers`; Deno is there to add:

```ts
tabs({ managers: ["pnpm", "npm", "yarn", "bun", "deno"] });
```

A command a manager has no form for, such as `npm ci` in pnpm, leaves that manager's tab out, keeps npm's, and adds an issue. Write that block as a `::code-group{sync="pm"}` by hand. Register comark-tabs before Shiki, so Shiki highlights every tab it adds.

## Icons

Give a tab an `icon`, either an Iconify name, such as `lucide:apple` or `logos:pnpm`, or the URL of an image. [comark-icon](/icon/) resolves it while parsing and draws it. The icon shows before the label in the strip, shows without the script, and looks and sizes like an `:icon`.

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

Set icons once for every block with `icons`, by label, for tabs that don't set their own. Icons come from the Iconify API by default. Pass the resolver the page's `:icon` uses as `iconResolver`, so they share its sets and `fetch`:

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

Size them with `--comark-icon-size`, and style them as [comark-icon's Theming page](/icon/theming/) describes.

## Validation

The plugin adds a problem with any block to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
`::code-group` 1, block 2: a code block needs a label. Put it in brackets after the language: ```bash [npm].
```

It reports a tab without a label, two tabs with the same label, an `npm2yarn` command a package manager has no form for, an `npm2yarn` block with no npm command, an icon it can't draw (in comark-icon's words), content outside every tab (it doesn't render), anything but code blocks in a code group, a block with no tabs, a `:::tabs-item` outside `::tabs` (it renders as plain content), and a prop the block doesn't read. Each one has its own rule in [Doctor](/doctor/). Rendering never throws.
It reports:

- A tab without a label, or two tabs with the same label.
- An icon it can't draw, in comark-icon's words.
- Content outside every tab, which doesn't render.
- Anything but code blocks in a code group.
- A block with no tabs.
- A `:::tabs-item` outside `::tabs`, which renders as plain content.
- A prop the block doesn't read.

Each one has its own rule in [Doctor](/doctor/). Rendering never throws.

## Zoom

Images in tabs zoom with [comark-zoom](/zoom) like any other image. A gallery or zoom group only pages through what's shown, so images in closed tabs stay out of it.

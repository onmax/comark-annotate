---
title: Getting started
description: Install comark-file-tree and register it.
install: pnpm add comark @comark/html comark-file-tree
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import fileTree, { components } from "comark-file-tree/html";

const render = createHtmlRenderer({ plugins: [fileTree()], components });
```

For Vue, React, or Svelte, import from `comark-file-tree/vue`, `comark-file-tree/react`, or `comark-file-tree/svelte`. The components add the styles when they mount. When you render on a server, import `comark-file-tree/style.css` with your own styles so the page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Icons

Without options, every folder and file gets the same plain glyph, and nothing is fetched. Pass an `iconResolver` from [comark-icon](/icon/) to give each file the icon of its type, the way VS Code shows it:

```ts
import { createIcons } from "comark-icon";
import fileTree from "comark-file-tree/html";

const icons = createIcons();
const plugins = [fileTree({ iconResolver: icons })];
```

The icons come from Iconify's [vscode-icons](https://icon-sets.iconify.design/vscode-icons/) set, through the API or a `collections` entry for `vscode-icons`. [Guides](/file-tree/guides/) covers choosing your own.

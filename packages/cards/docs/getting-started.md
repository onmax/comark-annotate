---
title: Getting started
description: Install comark-cards and register it.
install: pnpm add comark @comark/html comark-cards
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import cards, { components } from "comark-cards/html";

const render = createHtmlRenderer({ plugins: [cards()], components });
```

For Vue, React, or Svelte, import from `comark-cards/vue`, `comark-cards/react`, or `comark-cards/svelte`; the components add the styles when they mount. Import `comark-cards/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Icons

A card's `icon` is resolved by [comark-icon](/icon/) while parsing. By default icons come from the Iconify API; pass the page's resolver so every plugin shares it:

```ts
import { createIcons } from "comark-icon";
import cards from "comark-cards/html";

const plugins = [cards({ iconResolver: createIcons() })];
```

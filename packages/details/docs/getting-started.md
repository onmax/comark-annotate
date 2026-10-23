---
title: Getting started
description: Install comark-details and register it.
install: pnpm add comark @comark/html comark-details
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import details, { components } from "comark-details/html";

const render = createHtmlRenderer({ plugins: [details()], components });
```

For Vue, React, or Svelte, import from `comark-details/vue`, `comark-details/react`, or `comark-details/svelte`; the components add the styles when they mount. Import `comark-details/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Icons

Accordion items and collapsibles take an `icon`, resolved by [comark-icon](/icon/) while parsing. By default icons come from the Iconify API; pass the page's resolver so every plugin shares it:

```ts
import { createIcons } from "comark-icon";
import details from "comark-details/html";

const plugins = [details({ iconResolver: createIcons() })];
```

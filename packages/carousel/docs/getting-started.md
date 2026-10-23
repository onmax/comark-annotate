---
title: Getting started
description: Install comark-carousel and register it.
install: pnpm add comark @comark/html comark-carousel
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import carousel, { components } from "comark-carousel/html";

const render = createHtmlRenderer({ plugins: [carousel()], components });
```

For Vue, React, or Svelte, import from `comark-carousel/vue`, `comark-carousel/react`, or `comark-carousel/svelte`. When you render on a server, import `comark-carousel/style.css` and `comark-zoom/style.css` with your own styles. [Renderers](/guide/renderers/) covers the rest.

---
title: Getting started
description: Install comark-zoom and register it.
install: pnpm add comark @comark/html comark-zoom
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import zoom, { components } from "comark-zoom/html";

const render = createHtmlRenderer({ plugins: [zoom()], components });
```

`zoom({ images: false })` leaves images alone, so only `::zoom` blocks and images you mark with `{data-zoom}` zoom.

For Vue, React, or Svelte, import from `comark-zoom/vue`, `comark-zoom/react`, or `comark-zoom/svelte`. [Renderers](/guide/renderers/) covers server rendering, pages without a renderer, and zoom with other plugins.

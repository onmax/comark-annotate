---
title: Getting started
description: Install comark-toc and register it.
install: pnpm add comark @comark/html comark-toc
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import toc, { components } from "comark-toc/html";

const render = createHtmlRenderer({ plugins: [toc()], components });
```

For Vue, React, or Svelte, import from `comark-toc/vue`, `comark-toc/react`, or `comark-toc/svelte`; the components add the styles when they mount. Import `comark-toc/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

The links point at the heading ids Comark writes, so they work with any renderer that keeps them.

---
title: Getting started
description: Install comark-media and register it.
install: pnpm add comark @comark/html comark-media
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import media, { components } from "comark-media/html";

const render = createHtmlRenderer({ plugins: [media()], components });
```

The renderer inlines the styles once per document, and the output needs no script. For Vue, React, or Svelte, import from `comark-media/vue`, `comark-media/react`, or `comark-media/svelte`; the components add the styles when they mount. Import `comark-media/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

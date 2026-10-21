---
title: Getting started
description: Install comark-embed and register it.
install: pnpm add comark @comark/html comark-embed
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import embed, { components } from "comark-embed/html";

const render = createHtmlRenderer({ plugins: [embed()], components });
```

For Vue, React, or Svelte, import from `comark-embed/vue`, `comark-embed/react`, or `comark-embed/svelte`; the components add the styles when they mount. Import `comark-embed/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

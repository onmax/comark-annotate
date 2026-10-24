---
title: Getting started
description: Install comark-metrics and register it.
install: pnpm add comark @comark/html comark-metrics
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import metrics, { components } from "comark-metrics/html";

const render = createHtmlRenderer({ plugins: [metrics()], components });
```

The renderer inlines the styles once per document, and the output needs no script. For Vue, React, or Svelte, import from `comark-metrics/vue`, `comark-metrics/react`, or `comark-metrics/svelte`; the components add the styles when they mount. Import `comark-metrics/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

---
title: Getting started
description: Install comark-fields and register it.
install: pnpm add comark @comark/html comark-fields
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import fields, { components } from "comark-fields/html";

const render = createHtmlRenderer({ plugins: [fields()], components });
```

For Vue, React, or Svelte, import from `comark-fields/vue`, `comark-fields/react`, or `comark-fields/svelte`. The components add the styles when they mount. When you render on a server, import `comark-fields/style.css` with your own styles so the page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

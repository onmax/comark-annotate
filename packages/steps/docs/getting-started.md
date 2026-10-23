---
title: Getting started
description: Install comark-steps and register it.
install: pnpm add comark @comark/html comark-steps
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import steps, { components } from "comark-steps/html";

const render = createHtmlRenderer({ plugins: [steps()], components });
```

For Vue, React, or Svelte, import from `comark-steps/vue`, `comark-steps/react`, or `comark-steps/svelte`; the components add the styles when they mount. Import `comark-steps/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

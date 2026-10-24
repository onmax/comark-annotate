---
title: Getting started
description: Install comark-colors and register it.
install: pnpm add comark @comark/html comark-colors
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import colors, { components } from "comark-colors/html";

const render = createHtmlRenderer({ plugins: [colors()], components });
```

For Vue, React, or Svelte, import from `comark-colors/vue`, `comark-colors/react`, or `comark-colors/svelte`; the components add the styles when they mount. Import `comark-colors/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

Every entry also exports `isColor()`, the test the plugin runs on inline code, for a host that wants to check a value the same way.

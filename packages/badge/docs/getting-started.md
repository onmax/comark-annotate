---
title: Getting started
description: Install comark-badge and register it.
install: pnpm add comark @comark/html comark-badge
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import badge, { components } from "comark-badge/html";

const render = createHtmlRenderer({ plugins: [badge()], components });
```

For Vue, React, or Svelte, import from `comark-badge/vue`, `comark-badge/react`, or `comark-badge/svelte`; the components add the styles when they mount. Import `comark-badge/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

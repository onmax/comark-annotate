---
title: Getting started
description: Install comark-tabs and register it.
install: pnpm add comark @comark/html comark-tabs
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import tabs, { components } from "comark-tabs/html";

const render = createHtmlRenderer({ plugins: [tabs()], components });
```

For Vue, React, or Svelte, import from `comark-tabs/vue`, `comark-tabs/react`, or `comark-tabs/svelte`. Svelte needs 5.20 or later. [Renderers](/guide/renderers/) covers server rendering and using it with other plugins.

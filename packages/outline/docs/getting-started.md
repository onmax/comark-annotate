---
title: Getting started
description: Install comark-outline and register it.
install: pnpm add comark @comark/html comark-outline
---

## Usage

Register the plugin and pass the renderer's `components`:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { createHtmlRenderer } from "@comark/html";
import toc, { components } from "comark-outline/html";

const render = createHtmlRenderer({ plugins: [toc()], components });
```
::

For Vue, React, or Svelte, import from `comark-outline/vue`, `comark-outline/react`, or `comark-outline/svelte`; the components add the styles when they mount. Import `comark-outline/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

The links point at the heading ids Comark writes, so they work with any renderer that keeps them.

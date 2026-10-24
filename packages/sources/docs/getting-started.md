---
title: Getting started
description: Install comark-sources and register it.
install: pnpm add comark @comark/html comark-sources
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
import sources, { components } from "comark-sources/html";

const render = createHtmlRenderer({ plugins: [sources()], components });
```
::

For Vue, React, or Svelte, import from `comark-sources/vue`, `comark-sources/react`, or `comark-sources/svelte`; the components add the styles when they mount. Import `comark-sources/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

The citations are plain `sup` links, so they work in any renderer; the component draws the list and carries the styles for both.

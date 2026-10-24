---
title: Getting started
description: Install comark-table and register it.
install: pnpm add comark @comark/html comark-table
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import table, { components } from "comark-table/html";

const render = createHtmlRenderer({ plugins: [table({ root: "docs" })], components });
```

`root` is the folder `src` can't leave, and `base` the document's folder under it, as in [comark-include](/include/). In a browser or an edge runtime, pass `read`, a function that takes a path under the root and returns the file's text.

The HTML renderer inlines the script and styles once per document. For Vue, React, or Svelte, import from `comark-table/vue`, `comark-table/react`, or `comark-table/svelte`; the components start the script when they mount. Import `comark-table/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

---
title: Getting started
description: Install comark-links and register its plugins.
install: pnpm add comark @comark/html comark-links
---

## Usage

Register the plugins you want and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import { anchors, components, external } from "comark-links/html";

const render = createHtmlRenderer({
  plugins: [anchors(), external({ target: "_blank", hosts: ["example.com"] })],
  components,
});
```

Each plugin works alone, in any order. The package has no default export, so import the plugins by name.

`external()` does all its work while parsing, so its `target` and `rel` reach any renderer. The components draw the heading links, and add the styles once per document.

## Other renderers

For Vue, React, or Svelte, import from `comark-links/vue`, `comark-links/react`, or `comark-links/svelte`; the components add the styles when they mount. Import `comark-links/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

The components replace how `h1` to `h6` render, and draw a heading as it would be without them unless `anchors()` gave it a link. The heading stays where it was in the document's tree, so a table of contents built from the tree still finds it.

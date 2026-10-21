---
title: Getting started
description: Install comark-code and register it.
install: pnpm add comark @comark/html comark-code
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import code, { components } from "comark-code/html";

const render = createHtmlRenderer({ plugins: [code()], components });
```

The components replace how `pre` renders. The block keeps its own markup, so Shiki's highlighting and your `pre` styles still apply, and it works in a [code group](/tabs/components/#code-group) whichever plugin comes first.

For Vue, React, or Svelte, import from `comark-code/vue`, `comark-code/react`, or `comark-code/svelte` (Svelte 5.20 or later). [Renderers](/guide/renderers/) covers server rendering and using it with other plugins.

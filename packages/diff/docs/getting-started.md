---
title: Getting started
description: Install comark-diff and register it.
install: pnpm add comark @comark/html comark-diff
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
import diff, { components } from "comark-diff/html";

const render = createHtmlRenderer({ plugins: [diff()], components });
```
::

The renderer inlines the styles once per document, and the output needs no script. Add Comark's `shiki` plugin to keep the code's highlighting. [Renderers](/guide/renderers/) covers using it with other plugins.

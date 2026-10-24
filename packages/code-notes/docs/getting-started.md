---
title: Getting started
description: Install comark-code-notes and register it after Shiki.
install: pnpm add comark @comark/html comark-code-notes
---

## Usage

Register the plugin after Comark's `shiki`, and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import shiki from "@comark/html/plugins/shiki";
import codeNotes, { components } from "comark-code-notes/html";

const render = createHtmlRenderer({ plugins: [shiki(), codeNotes()], components });
```

The markers are drawn into the lines Shiki writes, so `codeNotes()` goes after `shiki()`. In the other order, the annotated code isn't highlighted and the plugin reports it. Without Shiki, it draws the lines itself.

The renderer inlines the styles once per document, and the output needs no script. For Vue, React, or Svelte, import from `comark-code-notes/vue`, `comark-code-notes/react`, or `comark-code-notes/svelte`; the components add the styles when they mount. Import `comark-code-notes/style.css` with your styles so a server-rendered page doesn't shift. It works with [comark-code](/code/)'s buttons, whose Copy leaves the markers out. [Renderers](/guide/renderers/) covers using it with other plugins.

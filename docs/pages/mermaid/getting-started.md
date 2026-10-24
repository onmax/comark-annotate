---
title: Getting started
description: Draw Mermaid through @onmax/comark, or register comark-pele alone.
install: pnpm add comark @comark/html comark-pele
---

## Usage

[@onmax/comark](/preset/) draws `mermaid` fences already: its `mermaid` option is on by default. To use comark-pele alone, register its plugin and pass its `Pele` component:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { createHtmlRenderer } from "@comark/html";
import pele, { Pele } from "comark-pele/html";

const render = createHtmlRenderer({ plugins: [pele()], components: { Pele } });
```
::

The HTML renderer puts static SVG in the page, so it needs no script, no browser, and no network, in Node or in a Cloudflare Worker. For Vue, React, or Svelte, import from `comark-pele/vue`, `comark-pele/react`, or `comark-pele/svelte`, or from the preset's entry for that renderer. Those components draw the same SVG on the server, then switch to Pele's `mount()` in the browser, which fits each diagram to its container and adds zoom.

## Through the preset

The preset's `mermaid` option takes comark-pele's options, or `false` to leave `mermaid` fences as code. [Its page](/preset/#mermaid) says when turning it off is worth it.

## Alone

On its own, comark-pele draws with Pele's colors. To put its diagrams on the `--comark-*` tokens, as the preset does, add `mermaidCss` from `@onmax/comark/client` to the page; [Theming](/mermaid/theming/) lists what it sets.

Comark has a built-in `mermaid` plugin too, which reads the same fences. Register only one of them for `mermaid` fences, or give comark-pele its own language with `pele({ languages: ["pele"] })`. [Renderers](/guide/renderers/) covers using it with other plugins.

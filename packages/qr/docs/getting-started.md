---
title: Getting started
description: Install comark-qr and register it.
install: pnpm add comark @comark/html comark-qr
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
import qr, { components } from "comark-qr/html";

const render = createHtmlRenderer({ plugins: [qr()], components });
```
::

For Vue, React, or Svelte, import from `comark-qr/vue`, `comark-qr/react`, or `comark-qr/svelte`; the components add the styles when they mount. Import `comark-qr/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

The parse plugin encodes the code with [uqr](https://github.com/unjs/uqr), Anthony Fu's zero-dependency ES module of 27 kB (8 kB gzipped) from his [QR Toolkit](https://qrcode.antfu.me), at its defaults, and writes its modules as an SVG path, so no renderer encodes anything.

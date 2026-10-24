---
title: Getting started
description: Install comark-badge and register it.
install: pnpm add comark @comark/html comark-badge
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
import badge, { components } from "comark-badge/html";

const render = createHtmlRenderer({ plugins: [badge()], components });
```
::

For Vue, React, or Svelte, import from `comark-badge/vue`, `comark-badge/react`, or `comark-badge/svelte`. The components add the styles when they mount. When you render on a server, import `comark-badge/style.css` with your own styles so the page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

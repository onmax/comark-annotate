---
title: Getting started
description: Install comark-diagrams and register it.
install: pnpm add comark @comark/html comark-diagrams
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import diagrams, { components } from "comark-diagrams/html";

const render = createHtmlRenderer({ plugins: [diagrams()], components });
```

Parsing waits for each diagram from the Kroki server, so the page needs no script and no request when it's read. Every diagram is drawn once per process, so a site that builds many pages asks for each one once.

The diagram's source is sent to `https://kroki.io` by default. To keep it private, run your own Kroki and pass its address as `server`, as the [Guides](/diagrams/guides/) describe:

```ts
diagrams({ server: "http://localhost:8000" });
```

Pass `draw: false` to leave every diagram as code and send nothing, such as in a linter.

For Vue, React, or Svelte, import from `comark-diagrams/vue`, `comark-diagrams/react`, or `comark-diagrams/svelte`; the components add the styles when they mount. Import `comark-diagrams/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

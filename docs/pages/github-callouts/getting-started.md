---
title: Getting started
description: Install comark-github-callouts and register it.
install: pnpm add comark @comark/html comark-github-callouts
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import githubCallouts, { components } from "comark-github-callouts/html";

const render = createHtmlRenderer({ plugins: [githubCallouts()], components });
```

The plugin is named `alert`, so it takes the place of Comark's built-in alert plugin, and works with `registerDefaultPlugins: false` too. A quote without a marker, or with a type GitHub doesn't have, stays a quote.

`githubCallouts({ titles: { note: "Nota", warning: "Aviso" } })` changes the default titles, for a site in another language.

For Vue, React, or Svelte, import from `comark-github-callouts/vue`, `comark-github-callouts/react`, or `comark-github-callouts/svelte`; the components add the styles when they mount. Import `comark-github-callouts/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

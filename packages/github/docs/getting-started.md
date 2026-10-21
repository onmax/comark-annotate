---
title: Getting started
description: Install comark-github and register its plugins.
install: pnpm add comark @comark/html comark-github
---

## Usage

Register the plugins you want and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import { callouts, components, html, references } from "comark-github/html";

const render = createHtmlRenderer({
  plugins: [callouts(), references({ repo: "onmax/comark-plugins" }), html()],
  components,
});
```

Each plugin works alone, in any order. `callouts()` is named `alert` and `html()` is named `html`, so they take the place of Comark's built-in plugins of those names, and work with `registerDefaultPlugins: false` too.

## Options

`callouts({ titles: { note: "Nota", warning: "Aviso" } })` changes the default titles, for a site in another language.

`references({ repo: "owner/name" })` is the repository a bare `#123` points into. Without it, `#123` stays text, while `@user` and `owner/name#123` still link. A `repo` that isn't `owner/name` is reported in `meta.issues`.

`html()` takes no options. It keeps GitHub's allowed tags and attributes; [Syntax](/github/syntax/#html) lists what goes.

## Other renderers

For Vue, React, or Svelte, import from `comark-github/vue`, `comark-github/react`, or `comark-github/svelte`; the callout components add the styles when they mount. Import `comark-github/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

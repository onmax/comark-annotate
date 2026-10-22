---
title: Getting started
description: Install comark-chips and register it.
install: pnpm add comark @comark/html comark-chips
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import chips, { components } from "comark-chips/html";

const render = createHtmlRenderer({ plugins: [chips()], components });
```

Parsing downloads each favicon and avatar once per process and inlines it, so a site that builds many pages asks once per image.

## Options

```ts
chips({
  // Keep the image URLs for the reader's browser to load, instead of downloading them while parsing.
  download: false,
  // A site's image, by its host. Google's favicon service by default.
  favicon: (host) => `https://${host}/favicon.ico`,
  // An account's image, by its GitHub login. Its GitHub avatar by default.
  avatar: (login) => `https://unavatar.io/github/${login}`,
});
```

Pass `download: false` where parsing runs in a browser: most sites don't let a page download their images, so each chip would try and then fall back to its URL anyway.

An avatar that answers with an HTTP error, such as an `@user` with no GitHub account, is reported in `meta.issues`. A site without a favicon gets a chip with no image.

## Other renderers

For Vue, React, or Svelte, import from `comark-chips/vue`, `comark-chips/react`, or `comark-chips/svelte`; the components add the styles when they mount. Import `comark-chips/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

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

Parsing downloads each favicon and avatar and inlines it. Each image is kept in `node_modules/.cache/comark-chips` for a week, so a site that builds many pages, or builds again, asks once per image.

## Options

```ts
chips({
  // Keep the image URLs for the reader's browser to load, instead of downloading them while parsing.
  download: false,
  // A site's image, by its host. Google's favicon service by default.
  favicon: (host) => `https://${host}/favicon.ico`,
  // An account's image, by its GitHub login. Its GitHub avatar by default.
  avatar: (login) => `https://unavatar.io/github/${login}`,
  // The folder that keeps images between builds. `false` keeps them in memory only.
  cache: ".comark/chips",
});
```

Pass `download: false` where parsing runs in a browser. Most sites don't let a page download their images, so each chip would try and then fall back to its URL anyway.

## Rate limits

Avatars from X, Bluesky, YouTube, GitLab, and `avatar="provider:name"` come from [unavatar.io](https://unavatar.io), which answers 25 downloads a day for each IP address without a plan. With the cache, each image counts once a week. GitHub avatars and favicons have no such limit.

When unavatar.io says no, the chip keeps the URL for the reader's browser, and `meta.issues` says to build again.

A CI that starts with no `node_modules` downloads everything every time. Set `cache` to a folder you commit, such as `.comark/chips`, and it downloads only the images that are new.

`meta.issues` reports an avatar that answers with an HTTP error, such as an `@user` with no GitHub account. A site without a favicon gets a chip with no image. Each problem has its own rule in [Doctor](/doctor/).

## Other renderers

For Vue, React, or Svelte, import from `comark-chips/vue`, `comark-chips/react`, or `comark-chips/svelte`. The components add the styles when they mount. When you render on a server, import `comark-chips/style.css` with your own styles so the page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

---
title: Getting started
description: Install comark-media and register it.
install: pnpm add comark @comark/html comark-media
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
import media, { components } from "comark-media/html";

const render = createHtmlRenderer({ plugins: [media()], components });
```
::

The renderer inlines the styles once per document, and the players' script once per document with a player. For Vue, React, or Svelte, import from `comark-media/vue`, `comark-media/react`, or `comark-media/svelte`; the components add the styles and start the players when they mount. Import `comark-media/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## The browser's controls

Videos and audio play with controls drawn with the [shared tokens](/guide/theming/), which a small script runs. Until it runs, and when a file can't play, the browser's own controls show, so the file still plays on a page that strips scripts. To always use the browser's controls, and leave the script out:

```ts
media({ controls: "native" });
```

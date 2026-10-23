---
title: Getting started
description: Install comark-media and register it.
install: pnpm add comark @comark/html comark-media
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import media, { components } from "comark-media/html";

const render = createHtmlRenderer({ plugins: [media()], components });
```

The renderer inlines the styles once per document, and the audio player's script once per document with audio. For Vue, React, or Svelte, import from `comark-media/vue`, `comark-media/react`, or `comark-media/svelte`; the components add the styles and start the audio player when they mount. Import `comark-media/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## The browser's audio player

Audio plays in a player drawn with the [shared tokens](/guide/theming/), which a small script runs. Until it runs, and when a file can't play, the browser's own player shows, so the audio still plays on a page that strips scripts. To always use the browser's player, and leave the script out:

```ts
media({ audio: "native" });
```

Videos always use the browser's controls.

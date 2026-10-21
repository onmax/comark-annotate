---
title: Getting started
description: Install comark-icon, register it, and choose where icons come from.
install: pnpm add comark @comark/html comark-icon
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import icon, { components } from "comark-icon/html";

const render = createHtmlRenderer({ plugins: [icon()], components });
```

For Vue, React, or Svelte, import from `comark-icon/vue`, `comark-icon/react`, or `comark-icon/svelte`; the `Icon` component adds the styles when it mounts. Import `comark-icon/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Where icons come from

With no options, the plugin fetches each icon from the [Iconify API](https://iconify.design/docs/api/) while parsing, once per process, a few icons per request. To build offline, or to keep the output from depending on Iconify, install the sets you use and pass them in `collections`:

```ts
import { icons as lucide } from "@iconify-json/lucide";
import icon from "comark-icon/html";

icon({ collections: { lucide }, fetch: false });
```

| Option | |
| --- | --- |
| `collections` | Sets by prefix, used before the API. A set is an Iconify set from `@iconify-json/*`, or SVG markup by name, for icons of your own. |
| `fetch` | `true` by default. `false` resolves only `collections`; a URL asks an Iconify API of your own. |

Icons of your own, from SVG files:

```ts
const brand = import.meta.glob("./icons/*.svg", { query: "?raw", import: "default", eager: true });

icon({
  collections: {
    brand: Object.fromEntries(
      Object.entries(brand).map(([path, svg]) => [path.split("/").pop()!.replace(".svg", ""), svg]),
    ),
  },
});
```

`:icon{name="brand:logo"}` then draws `icons/logo.svg`.

## Sharing options with other plugins

`createIcons()` makes one resolver with these options. Pass it to the plugin, and to other plugins that draw icons, so a page sets them once:

```ts
import icon, { createIcons } from "comark-icon/html";

const icons = createIcons({ collections: { lucide } });
const plugins = [icon(icons)];
```

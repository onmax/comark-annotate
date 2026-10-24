---
title: Getting started
description: Install comark-cast, register it, and record a cast.
install: pnpm add comark @comark/html comark-cast
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import cast, { components } from "comark-cast/html";

const render = createHtmlRenderer({ plugins: [cast({ root: "docs" })], components });
```

For Vue, React, or Svelte, import from `comark-cast/vue`, `comark-cast/react`, or `comark-cast/svelte`; the components add the styles when they mount. Import `comark-cast/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `root` | `"."` | The folder `src` paths start from. A cast can't be read from outside it. |
| `read` | Reads from disk | Reads a file by its path under `root`, and returns its text or `undefined`. Pass one in a browser or an edge runtime. |

The default reader refuses symlinks that lead out of `root`, and loads `node:fs` only on its first read, so the plugin loads anywhere when you pass `read`.

## Record a cast

Install [asciinema](https://docs.asciinema.org/getting-started/) and record the command, with the terminal sized to what the page has room for:

```sh
asciinema rec --cols 80 --rows 20 --command "pnpm test" docs/test.cast
```

Then show it with `::cast{src="test.cast"}`. Casts in asciinema's v2 and v3 formats both work.

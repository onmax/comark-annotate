---
title: comark-carousel
description: A carousel of any Markdown content, written in Markdown.
tagline: Slides of images, code, or anything else that scroll and snap, with arrows, dots, keys, and zoom.
install: pnpm add comark @comark/html comark-carousel
---

::tabs
:::example{label="Images"}
```md
::carousel{title="Filters"}
![Filter toolbar wrapping](/before.png)

![Filter toolbar on one row](/after.png)

![Forecast planning dashboard](/dashboard.png)
::
```
:::

:::example{label="Any content"}
````md
::carousel{title="Setup"}
:::slide{title="Install"}
```sh
pnpm add comark @comark/html comark-carousel
```
:::

:::slide{title="Register"}
Pass the plugin and its `components` to the renderer.
:::

:::slide{title="Write"}
> Every block inside `::carousel` is a slide.
:::
::
````
:::

:::example{label="Two columns"}
```md
::carousel{columns=2}
![Before](/before.png)

![After](/after.png)
::
```
:::
::

Every block inside `::carousel` is a slide; use `:::slide` when one slide holds several blocks. Slides scroll and snap without a script. The script adds arrows, dots, and arrow keys, and a click zooms a slide with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import carousel, { components } from "comark-carousel/html";

const render = createHtmlRenderer({ plugins: [carousel()], components });
```

`columns=2` or `columns=3` shows several slides at once on a wide page and one at a time on a narrow one. `zoom=false` turns zoom off. Override `--cc-gap` to change the space between slides.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-carousel/html` inlines the styles and scripts once per document |
| `@comark/vue` | `comark-carousel/vue` |
| `@comark/react` | `comark-carousel/react` |
| `@comark/svelte` | `comark-carousel/svelte` |

Slides zoom with [comark-zoom](/zoom), which comes with the package. Import `comark-carousel/style.css` and `comark-zoom/style.css` with your styles when you render on a server.

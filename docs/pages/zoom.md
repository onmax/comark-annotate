---
title: comark-zoom
description: Zoom images and any block like medium-zoom, written in Markdown.
tagline: Click an image or any block to zoom it out of its place. Escape, Back, or a click around it closes it.
install: pnpm add comark @comark/html comark-zoom
---

::tabs
:::example{label="Image"}
```md
![Forecast planning dashboard](/dashboard.png)
```
:::

:::example{label="Any block"}
```md
::zoom{title="Retry policy"}
| Attempt | Wait |
| --- | --- |
| 1 | 1 s |
| 2 | 4 s |
| 3 | 16 s |
::
```
:::

:::example{label="Group"}
```md
::zoom{group="tour" title="Before"}
![Filter toolbar wrapping](/before.png)
::

::zoom{group="tour" title="After"}
![Filter toolbar on one row](/after.png)
::
```
:::
::

Content images zoom on their own, except images inside links. Items in one `group` page through a single zoomed view with a strip of them at the bottom; arrow keys and the strip move between them. Enter or Space opens a focused item, and focus returns to it when the view closes.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import zoom, { components } from "comark-zoom/html";

const render = createHtmlRenderer({ plugins: [zoom()], components });
```

`zoom({ images: false })` leaves images alone, so only `::zoom` blocks zoom. Give an image a `data-zoom-src` to load a larger file when it opens.

## Renderers

The same markup comes out of every renderer. Import the components from the entry for yours:

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-zoom/html` inlines the styles and script once per document |
| `@comark/vue` | `comark-zoom/vue` |
| `@comark/react` | `comark-zoom/react` |
| `@comark/svelte` | `comark-zoom/svelte` |

The Vue, React, and Svelte components start the script when they mount and stop it when the last one unmounts. Import `comark-zoom/style.css` with your styles so a server-rendered page doesn't shift when the script starts.

## Customize

The zoomed view fires `comark-zoom:open`, `comark-zoom:change`, and `comark-zoom:close` on the item. `open` and `change` carry the dialog's `header` and `footer`, and a `layer` over the zoomed content, sized to it, where a host can draw its own pins or controls.

```ts
document.addEventListener("comark-zoom:open", (event) => {
  const pin = document.createElement("button");
  pin.textContent = "1";
  pin.style.cssText = "position:absolute;left:40%;top:20%";
  event.detail.layer.append(pin);
});
```

Theme it with `--cz-backdrop`, `--cz-ink`, `--cz-muted`, `--cz-line`, and `--cz-active`. An item that needs styles from an ancestor names it with `data-zoom-context`, and the zoomed copy goes inside an empty copy of that ancestor.

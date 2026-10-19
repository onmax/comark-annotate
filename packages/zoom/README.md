# comark-zoom

Zoom images and any block like medium-zoom, written in Markdown. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

```sh
pnpm add comark comark-zoom
```

```ts
import { createHtmlRenderer } from "@comark/html";
import zoom, { components } from "comark-zoom/html";

const render = createHtmlRenderer({ plugins: [zoom()], components });
```

Content images zoom on their own, except images inside links. Wrap any other block in `::zoom` to make it zoomable, and give blocks the same `group` to page through them in one zoomed view with a strip at the bottom:

```md
![Dashboard](dashboard.png)

::zoom{group="tour" title="Step one"}
Any Markdown: code, callouts, tables.
::
```

The zoomed view grows out of the item's place on the page. Escape, Back, and a click around it close it; arrow keys and the strip page through a group; Enter or Space opens a focused item. `zoom({ images: false })` leaves images alone. Add `data-zoom-src` to an image to load a larger file when it zooms.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-zoom/html`: the script is inlined once per document |
| `@comark/vue` | `comark-zoom/vue` |
| `@comark/react` | `comark-zoom/react` |
| `@comark/svelte` | `comark-zoom/svelte` |

Each entry exports the parse plugin as `default` and the renderer's `components`. Without a renderer, call `start(css)` from `comark-zoom/client` once on a page with `data-zoom` elements; it returns a function that stops it.

## Customize

The zoomed view fires `comark-zoom:open`, `comark-zoom:change`, and `comark-zoom:close` on the item. `open` and `change` carry the dialog's `header`, `footer`, and a `layer` sized to the zoomed content, so a host can add its own controls or draw pins over it. Theme it with the `--cz-backdrop`, `--cz-ink`, `--cz-muted`, `--cz-line`, and `--cz-active` variables.

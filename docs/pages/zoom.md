---
title: comark-zoom
description: Zoom images and any block like medium-zoom, written in Markdown.
tagline: Click an image or any block to zoom it out of its place. Escape, Back, or a click around it closes it.
install: pnpm add comark @comark/html comark-zoom
---

::examples
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

Click an item to zoom it; Escape, Back, or a click around it closes it. Enter or Space opens a focused item, and focus returns to it when the view closes.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import zoom, { components } from "comark-zoom/html";

const render = createHtmlRenderer({ plugins: [zoom()], components });
```

`zoom({ images: false })` leaves images alone, so only `::zoom` blocks and images you mark with `{data-zoom}` zoom.

## Components

### Images

Content images zoom on their own, except images inside links, which keep their link. The zoomed view shows the image's `alt` text as its title, and an image grows no larger than its natural size, so it stays sharp.

Give an image a `data-zoom-src` to load a larger file when it opens. The zoom shows the page's image until the larger file has loaded, and the strip of a group keeps the page's images. To keep one image from zooming, give it `zoom=false`:

```md
![Company logo](/logo.png){zoom=false}
```

### zoom

Zooms any block: a table, a code block, a diagram, or several of them together.

::example
```md
::zoom{title="Retry policy"}
| Attempt | Wait |
| --- | --- |
| 1 | 1 s |
| 2 | 4 s |
| 3 | 16 s |
::
```
::

| Prop | |
| --- | --- |
| `title` | Heading of the zoomed view. |
| `group` | Items with the same group page through one zoomed view. |
| `#id`, `.class` | Go on the block, as on any other. |

## Guides

### Groups

Items in one `group` page through a single zoomed view with a strip of them at the bottom. Arrow keys and the strip move between them. Items that are hidden when the view opens, such as those in a closed tab, are left out.

::example
```md
::zoom{group="tour" title="Before"}
![Filter toolbar wrapping](/before.png)
::

::zoom{group="tour" title="After"}
![Filter toolbar on one row](/after.png)
::
```
::

### Renderers

The same markup comes out of every renderer. Import the components from the entry for yours:

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-zoom/html` inlines the styles and script once per document |
| `@comark/vue` | `comark-zoom/vue` |
| `@comark/react` | `comark-zoom/react` |
| `@comark/svelte` | `comark-zoom/svelte` |

The Vue, React, and Svelte components start the script when they mount and stop it when the last one unmounts. Import `comark-zoom/style.css` with your styles so a server-rendered page doesn't shift when the script starts.

Without a renderer, call `start()` from `comark-zoom/client` once on a page with `data-zoom` elements. It adds the styles and returns a function that stops it.

### Events

The zoomed view fires `comark-zoom:open`, `comark-zoom:change`, and `comark-zoom:close` on the item. `open` and `change` carry the dialog's `header` and `footer`, and a `layer` over the zoomed content, sized to it, where a host can draw its own pins or controls. `copyOf(element)` finds the copy of a page element in the zoomed view, and `originalOf(element)` goes back, so a pin can follow what it points at. Both return `null` for anything the zoom doesn't show.

```ts
document.addEventListener("comark-zoom:open", (event) => {
  const pin = document.createElement("button");
  pin.textContent = "1";
  pin.style.cssText = "position:absolute;left:40%;top:20%";
  event.detail.layer.append(pin);
});
```

### Theming

The styles follow [shadcn/ui](https://ui.shadcn.com). On a site that already uses its CSS variables, the zoomed view matches it with no setup, and a `.dark` class anywhere above them switches the theme. Elsewhere they use shadcn's neutral theme and follow the system's light or dark mode.

Set the `--comark-*` tokens to theme zoom, carousel, and annotate at once. Each one wins over its shadcn variable, and works on `:root` or on any ancestor:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-background` | `--background` | Button faces, the zoom backdrop, the ring around stamps |
| `--comark-foreground` | `--foreground` | Text, icons, the current thumbnail, slide panels |
| `--comark-muted` | `--muted-foreground` | The zoom and carousel counters |
| `--comark-border` | `--border` | Button, thumbnail, and screenshot borders |
| `--comark-accent` | `--accent` | Hovered buttons |
| `--comark-ring` | `--ring` | Focus rings |
| `--comark-radius` | `--radius` | Corners, a little smaller on buttons and images |
| `--comark-font` | `--font-sans` | The zoomed view's header |

```css
:root {
  --comark-accent: oklch(0.95 0.03 250);
  --comark-radius: 0.25rem;
}
```

The rules sit in a `comark` CSS layer, so any plain rule of your own wins without `!important`, such as `.cc-step { border-radius: 0 }`. shadcn/ui before Tailwind 4 stores colors as bare HSL numbers, so map those: `--comark-border: hsl(var(--border))`.

[Nuxt UI](https://ui.nuxt.com) names its variables differently. Map them once:

```css
:root {
  --comark-background: var(--ui-bg);
  --comark-foreground: var(--ui-text-highlighted);
  --comark-muted: var(--ui-text-muted);
  --comark-border: var(--ui-border);
  --comark-accent: var(--ui-bg-elevated);
  --comark-ring: var(--ui-primary);
  --comark-radius: calc(var(--ui-radius) * 2);
}
```

To theme only the zoomed view, set `--cz-backdrop`, `--cz-ink`, `--cz-muted`, `--cz-line`, `--cz-hover`, or `--cz-active`; each overrides the token it replaces. An item that needs styles from its ancestors names them with `data-zoom-context`, a selector, and the zoomed copy goes inside empty copies of every ancestor that matches.

### Captions beside the zoom

`data-zoom-aside` names an element, by selector, that the zoomed view shows beside the item at its own size, so a caption stays readable however far the item zooms. It's the first match that neither holds the item nor sits in it, in its innermost `data-zoom-context` or else its parent. On a narrow screen it sits below. comark-annotate uses it for a screenshot's notes.

```html
<figure>
  <img data-zoom data-zoom-aside="figcaption" src="chart.png" alt="Weekly sales">
  <figcaption>Sales dip in week 3, when the store closed.</figcaption>
</figure>
```

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders it. The zoom behaves like [medium-zoom](https://github.com/francoischalifour/medium-zoom).

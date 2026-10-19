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

Slides scroll and snap without a script. The script adds arrows, dots, and arrow keys, and a click zooms a slide.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import carousel, { components } from "comark-carousel/html";

const render = createHtmlRenderer({ plugins: [carousel()], components });
```

## Components

### carousel

Every block inside `::carousel` is a slide, unless it holds `:::slide` blocks.

::example
```md
::carousel{title="Filters"}
![Filter toolbar wrapping](/before.png)

![Filter toolbar on one row](/after.png)
::
```
::

| Prop | |
| --- | --- |
| `title` | Name read out by screen readers. Default `Carousel`. |
| `columns` | `2` or `3` shows several slides at once on a wide page and one at a time on a narrow one. |
| `zoom` | `false` turns zoom off. |

### slide

One slide that holds several blocks. Once a carousel has a `:::slide`, only its slides count.

::example
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
::
````
::

| Prop | |
| --- | --- |
| `title` | Heading of the slide when it's zoomed. |

## Guides

### Zoom

A click zooms a slide, with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at. Zoom comes from [comark-zoom](/zoom), which comes with the package.

### Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-carousel/html` inlines the styles and scripts once per document |
| `@comark/vue` | `comark-carousel/vue` |
| `@comark/react` | `comark-carousel/react` |
| `@comark/svelte` | `comark-carousel/svelte` |

Import `comark-carousel/style.css` and `comark-zoom/style.css` with your styles when you render on a server.

### Theming

The styles follow [shadcn/ui](https://ui.shadcn.com). On a site that already uses its CSS variables, the arrows and dots match it with no setup, and a `.dark` class anywhere above them switches the theme. Elsewhere they use shadcn's neutral theme and follow the system's light or dark mode.

Set the `--comark-*` tokens to theme zoom, carousel, and annotate at once. Each one wins over its shadcn variable, and works on `:root` or on any ancestor:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-background` | `--background` | Button faces, the zoom backdrop, the ring around stamps |
| `--comark-foreground` | `--foreground` | Text, icons, the current dot and thumbnail |
| `--comark-muted` | `--muted-foreground` | The zoom counter |
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

Override `--cc-gap` to change the space between slides.

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders it.

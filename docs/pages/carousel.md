---
title: comark-carousel
description: A carousel of any Markdown content, written in Markdown.
tagline: Slides of images, code, or anything else that scroll and snap, with arrows, a counter, keys, and zoom.
install: pnpm add comark @comark/html comark-carousel
---

::examples
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

Slides scroll and snap without a script, with a scrollbar to reach the others. The script swaps the scrollbar for arrows, a slide counter, and arrow keys, and a click zooms a slide.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import carousel, { components } from "comark-carousel/html";

const render = createHtmlRenderer({ plugins: [carousel()], components });
```

For Vue, React, or Svelte, import from `comark-carousel/vue`, `comark-carousel/react`, or `comark-carousel/svelte`, and import `comark-carousel/style.css` and `comark-zoom/style.css` with your styles when you render on a server. [Renderers](/guide/renderers/) covers the rest.

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
| `title` | Name read out by screen readers, and the heading of a zoomed slide that has no title or image of its own. Default `Carousel`. |
| `columns` | `2` or `3` shows several slides at once on a wide page and one at a time on a narrow one. Default `1`. |
| `zoom` | `false` turns zoom off. |

Props can be inline or bound, such as `:columns="2"`. Bind `zoom` and `title` to the document or its front matter, not to render-time data: each slide takes them while parsing.

### slide

One slide that holds several blocks. Once a carousel has a `:::slide`, only its slides count: anything else inside it is dropped and reported. A `:::slide` outside a carousel renders as plain content.

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

An image alone in a slide, or alone in its paragraph, is centered, and so is a link around one. An image inside a sentence stays in the text.

## Guides

### Keys

With focus in a carousel, the left and right arrow keys page through it, following the reading direction on a right-to-left page. They leave alone keys pressed with Alt, Ctrl, Meta, or Shift, and keys meant for a form field, video, `<summary>`, menu, tab list, slider, combo box, tree, or a wide code block in a slide. From a link or a button, they page. A disabled arrow keeps its focus, so the keys keep working. Paging jumps instead of scrolling smoothly when the reader prefers reduced motion.

### Validation

The plugin adds a problem with any carousel to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
carousel 2 ("Setup") drops the paragraph "Pass the plugin" because it sits outside every :::slide; move it into a :::slide.
```

It reports content outside every `:::slide`, a carousel with no slides, `columns` that isn't 1, 2, or 3, a `:::slide` outside a carousel, and a `:zoom` or `:title` that reads render-time data.

### Zoom

A click zooms a slide, with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at. Zoom comes from [comark-zoom](/zoom/), which comes with the package. For annotated screenshots in a carousel, see the [recipe](/recipes/carousel/).

### Theming

The arrows, counter, and slide panels follow the shared tokens in [Theming](/guide/theming/). Override `--cc-gap` to change the space between slides. Each slide sits on a soft panel as tall as the tallest one, so slides of different heights line up; set `--cc-surface` to change its color, or to `transparent` with `.cc-slide { padding: 0 }` to drop it.

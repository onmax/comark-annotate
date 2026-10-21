---
title: Components
description: carousel and slide, and the props each takes.
---

## carousel

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

## slide

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

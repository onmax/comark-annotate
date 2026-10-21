---
title: Components
description: Images that zoom on their own, and the zoom block for anything else.
---

## Images

Content images zoom on their own, except images inside links, which keep their link. The zoomed view shows the image's `alt` text as its title, and an image grows no larger than its natural size, so it stays sharp.

Give an image a `data-zoom-src` to load a larger file when it opens. The zoom shows the page's image until the larger file has loaded, and the strip of a group keeps the page's images. To keep one image from zooming, give it `zoom=false`:

```md
![Company logo](/logo.png){zoom=false}
```

## zoom

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

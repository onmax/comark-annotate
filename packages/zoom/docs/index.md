---
title: comark-zoom
description: Zoom images and any block like medium-zoom, written in Markdown.
keywords: lightbox, medium-zoom, image zoom, enlarge, fullscreen, gallery, popup, modal, magnify
tagline: Click an image or any block to zoom it out of its place. Escape, Back, or a click around it closes it.
install: pnpm add comark @comark/html comark-zoom
group: Page behavior
icon: zoom-in
blurb: Zoom images and any block
credits: 'Modeled on <a href="https://github.com/francoischalifour/medium-zoom">medium-zoom</a>.'
---

::examples
:::example{label="Image"}
```md
![Office correlations dashboard](/dashboard.png)
```
:::

:::example{label="Any block"}
```md
::zoom{title="Deploy retry policy"}
| Attempt | Wait |
| --- | --- |
| 1 | 1 s |
| 2 | 4 s |
| 3 | Until the pigeons leave |
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

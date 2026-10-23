---
title: comark-figure
description: Image captions in Markdown, from the title, rendered as native figure and figcaption.
tagline: Give an image a title and get a figure with a caption, while its alt text stays alt text.
install: pnpm add comark comark-figure
group: Markdown syntax
icon: image
blurb: Image captions from the title
credits: 'After <a href="https://github.com/arve0/markdown-it-implicit-figures">markdown-it-implicit-figures</a>, which reads the caption from the title the same way.'
---

::examples
:::example{label="Caption"}
```md
![The dashboard with three charts of office metrics](/dashboard.png "Office correlations, week 42")
```
:::

:::example{label="In a list"}
```md
1. Open the filters.

   ![Filter toolbar wrapping onto two rows](/before.png "Before: the toolbar wraps")
2. Narrow the window.

   ![Filter toolbar on one row](/after.png "After: one row at any width")
```
:::
::

An image alone in its paragraph with a title, `![alt](src "Caption")`, renders as `<figure>` with the title in `<figcaption>`. The alt text still describes the image to screen readers, and the caption is what everyone reads under it.

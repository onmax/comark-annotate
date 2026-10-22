---
title: comark-carousel
description: A carousel of any Markdown content, written in Markdown.
tagline: Slides of images, code, or anything else that scroll and snap, with arrows, a counter, keys, and zoom.
install: pnpm add comark @comark/html comark-carousel
group: Page behavior
icon: gallery-horizontal-end
blurb: Slides of any content
---

::examples
:::example{label="Images"}
```md
::carousel{title="Filters"}
![Filter toolbar wrapping](/before.png)

![Filter toolbar on one row](/after.png)

![Office correlations dashboard](/dashboard.png)
::
```
:::

:::example{label="Titled slides"}
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
> Each `:::slide` is one slide, however many blocks it holds.
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

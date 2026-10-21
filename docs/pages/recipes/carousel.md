---
title: Screenshots in a carousel
description: A walkthrough of annotated screenshots, one step per slide.
tagline: Put each step of a flow on its own slide, with its marks and notes, and the reader pages through them in place or zoomed.
install: pnpm add comark @comark/html comark-annotate comark-carousel
---

::example
```md
::carousel{title="Exporting a forecast"}
:::screenshot{src="/dashboard.png" alt="Forecast planning dashboard" title="1. Find the export"}
::::annotation{x=81.8 y=5.3 w=14.1 h=7.3}
**Export CSV** sits in the page header.
::::
:::

:::screenshot{src="/before.png" alt="Filter toolbar with five filters" title="2. Set the filters" viewport="640x250"}
::::annotation{x=5 y=29.6 w=90 h=45.3 color="amber"}
The export includes only the rows these filters show.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" title="3. Apply" viewport="640x250"}
::::annotation{x=82.5 y=34.8 w=10.5 h=14.2 mark="check" color="green"}
**Apply** updates the table, and the export follows it.
::::
:::
::
```
::

Each screenshot is a slide. Its `title` heads the slide, so the reader knows which step they're on, and the notes stay with their screenshot. A click zooms the current slide, and the zoomed view pages through the others.

## When to use it

Use a carousel for a sequence: the steps of a flow, or one view at several sizes. For one view before and after a change, use [`::compare`](/annotate/components/#compare), which is a two-column carousel already and continues the note numbers from one side to the other.

## Two at a time

`columns=2` shows two steps side by side on a wide page and one at a time on a narrow one:

```md
::carousel{title="Exporting a forecast" columns=2}
:::screenshot{src="/dashboard.png" alt="Forecast planning dashboard" title="1. Find the export"}
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" title="2. Apply"}
:::
::
```

Each slide sits on a soft panel as tall as the tallest one, so screenshots of different heights line up. Set `--cc-surface: transparent` to drop the panel, as [Theming](/guide/theming/#each-plugins-own) shows.

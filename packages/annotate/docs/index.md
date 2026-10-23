---
title: comark-annotate
description: Hand-drawn marks, numbered notes, and arrows on screenshots, written in Markdown.
tagline: Mark up screenshots in Markdown with hand-drawn marks, numbered notes, arrows, and before/after comparisons.
install: pnpm add comark @comark/html comark-annotate
group: Review blocks
icon: scribble-loop
blurb: Marks and notes on screenshots
credits: 'Marks from <a href="https://annotationkit.vercel.app">AnnotationKit</a>.'
---

::examples
:::example{label="Before / after"}
```md
::compare
:::screenshot{src="/before.png" alt="Filter toolbar wrapping onto a second row" viewport="640x250"}
::::annotation{x=4.5 y=28.7 w=90.9 h=44.4 color="red"}
Moon phase and vibes don't fit, so the toolbar wraps and pushes the table down.
::::

::::annotation{x=22.4 y=50.4 w=13.3 h=20.6 mark="circle" color="red"}
**Apply** sits 6px lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" viewport="640x250"}
::::annotation{x=68 y=33.1 w=13.3 h=16 mark="highlight" color="blue"}
Moon phase and vibes collapse into **+2 filters**.
::::

::::annotation{x=82.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```
:::

:::example{label="Before / after slider"}
```md
::compare{mode="slider"}
:::screenshot{src="/before.png" alt="Filter toolbar wrapping onto a second row" viewport="640x250"}
::::annotation{x=22.4 y=50.4 w=13.3 h=20.6 mark="circle" color="red"}
**Apply** sits 6px lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" viewport="640x250"}
::::annotation{x=82.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```
:::

:::example{label="Arrows only"}
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=37 y=33.1 w=16.4 h=5.2 mark="none" side="top"}
Bugs fixed fell with the duck supply.
:::

:::annotation{x=66.1 y=17 w=30.5 h=24.6 mark="none" side="top"}
r now counts the office cat.
:::

:::annotation{x=4 y=77.3 w=92 h=8.2 mark="none" side="left"}
The pigeons ate week 15.
:::
::
```
:::

:::example{label="Side notes"}
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=37 y=33.1 w=16.4 h=5.2 mark="underline" side="top" color="red"}
Bugs fixed fall for the first time this quarter. So do the ducks.
:::

:::annotation{x=66.1 y=17 w=30.5 h=24.6 side="right"}
r now counts the office cat.
:::

:::annotation{x=4 y=77.3 w=75.5 h=8.2 mark="highlight" side="left" color="amber"}
Week 15 is missing for the pigeons.
:::

:::annotation{x=85 y=46 w=9.7 h=9.3 mark="circle"}
**Apply** waits until every filter is set, moon phase included.
:::
::
```
:::

:::example{label="Marks"}
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=82.4 y=5.3 w=14.2 h=8.8}
`box` frames an element.
:::

:::annotation{x=35.8 y=32.3 w=18.8 h=6.6 mark="circle"}
`circle` rings a small detail.
:::

:::annotation{x=3.5 y=5.9 w=26.8 h=7.7 mark="underline" color="blue"}
`underline` marks text.
:::

:::annotation{x=61.2 y=76.6 w=18 h=9.7 mark="highlight" color="amber"}
`highlight` washes over an area.
:::

:::annotation{x=5.3 y=46 w=21.7 h=9.3 mark="cross" color="red"}
`cross` strikes something out.
:::

:::annotation{x=85 y=46 w=9.7 h=9.3 mark="check" color="green"}
`check` approves and sits beside its target.
:::
::
```
:::
::

Hover a mark to highlight its note, or a note to highlight its mark. Click a screenshot to zoom it.

To share a screenshot, press its Copy button, or focus it and press Ctrl+C (⌘C on a Mac). You get a PNG with the marks and notes drawn in. The browser's own Copy Image gives you the same PNG once the pointer has been over the screenshot. Copying needs setup in two cases:

- An image from another origin needs CORS headers from its server.
- A page in an iframe needs `allow="clipboard-write"` on the frame.

A comparison shows its screenshots side by side, or one at a time on a narrow page, and zooms them as one gallery. A slider stacks the two screenshots, and you drag the divider to reveal one or the other.

Everything reads the same without a script. [zoom](/zoom/) and [carousel](/carousel/) come with the package. To page through screenshots spread across a page, or show a flow one step at a time, see the [recipes](/recipes/zoom/).

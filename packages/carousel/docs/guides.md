---
title: Guides
description: Keys, validation, zoom, and theming.
---

## Keys

With focus in a carousel, the left and right arrow keys page through it, following the reading direction on a right-to-left page. They leave alone keys pressed with Alt, Ctrl, Meta, or Shift, and keys meant for a form field, video, `<summary>`, menu, tab list, slider, combo box, tree, or a wide code block in a slide. From a link or a button, they page. A disabled arrow keeps its focus, so the keys keep working. Paging jumps instead of scrolling smoothly when the reader prefers reduced motion.

## Validation

The plugin adds a problem with any carousel to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
carousel 2 ("Setup") drops the paragraph "Pass the plugin" because it sits outside every :::slide; move it into a :::slide.
```

It reports content outside every `:::slide`, a carousel with no slides, `columns` that isn't 1, 2, or 3, a `:::slide` outside a carousel, and a `:zoom` or `:title` that reads render-time data.

## Zoom

A click zooms a slide, with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at. Zoom comes from [comark-zoom](/zoom/), which comes with the package. For annotated screenshots in a carousel, see the [recipe](/recipes/carousel/).

## Theming

The arrows, counter, and slide panels follow the shared tokens in [Theming](/guide/theming/). Override `--cc-gap` to change the space between slides. Each slide sits on a soft panel as tall as the tallest one, so slides of different heights line up; set `--cc-surface` to change its color, or to `transparent` with `.cc-slide { padding: 0 }` to drop it.

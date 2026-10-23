---
title: Guides
description: Keys, validation, and zoom.
---

## Keys

With focus in a carousel, the left and right arrow keys page through it, following the reading direction on a right-to-left page. They leave alone keys pressed with Alt, Ctrl, Meta, or Shift, and keys meant for a form field, video, `<summary>`, menu, tab list, slider, combo box, tree, or a wide code block in a slide. From a link or a button, they page. A disabled arrow keeps its focus, so the keys keep working. Paging jumps instead of scrolling smoothly when the reader prefers reduced motion.

## Validation

The plugin adds a problem with any carousel to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
carousel 2 ("Setup") drops the paragraph "Pass the plugin" because it sits outside every :::slide; move it into a :::slide.
```

It reports content outside every `:::slide`, a carousel with no slides, `columns` that isn't 1, 2, or 3, a `:::slide` outside a carousel, a `:zoom` or `:title` that reads render-time data or a missing key, and a prop it doesn't know. Each one has its own rule in [Doctor](/doctor/).

## Zoom

A click zooms a slide, with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at. Zoom comes from [comark-zoom](/zoom/), which comes with the package. For annotated screenshots in a carousel, see the [recipe](/recipes/carousel/).

---
title: Guides
description: Keys, validation, and zoom.
---

## Keys

With focus in a carousel, the left and right arrow keys page through it. On a right-to-left page they follow the reading direction. They also page when focus is on a link or a button.

The carousel leaves these keys alone:

- Keys pressed with Alt, Ctrl, Meta, or Shift.
- Keys meant for a form field, video, `<summary>`, menu, tab list, slider, combo box, tree, or a wide code block in a slide.

A disabled arrow keeps its focus, so the keys keep working. When the reader prefers reduced motion, paging jumps instead of scrolling smoothly.

## Validation

The plugin adds a problem with any carousel to `meta.issues`, as [Validation](/guide/validation/) describes:

```txt
carousel 2 ("Setup") drops the paragraph "Pass the plugin" because it sits outside every :::slide; move it into a :::slide.
```

It reports:

- Content outside every `:::slide`.
- A carousel with no slides.
- `columns` that isn't 1, 2, or 3.
- A `:::slide` outside a carousel.
- A `:zoom` or `:title` that reads render-time data or a missing key.
- A prop it doesn't know.

Each one has its own rule in [Doctor](/doctor/).

## Zoom

A click zooms a slide, with the others in a strip at the bottom. Paging in the zoomed view moves the carousel, so closing it lands on the slide you were looking at. Zoom comes from [comark-zoom](/zoom/), which comes with the package. For annotated screenshots in a carousel, see the [recipe](/recipes/carousel/).

---
title: Theming
description: The mark colors, the handwriting, the room for side notes, and the classes of screenshots and comparisons.
---

Screenshots and comparisons follow the page's theme through the shared tokens. The mark colors are separate from the theme, because each one means something. The rules sit in a `comark` CSS layer, so any plain rule of your own wins. `::diff` is in [comark-diff](/diff/), which has its own [Theming page](/diff/theming/).

## Shared tokens

Annotate reads these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The Copy button, the slider's line and grip, the ring around stamps |
| `--comark-foreground` | The Copy button's icon, the slider's grip, the status after a copy |
| `--comark-border` | The outline around screenshots, the Copy button, the slider's grip |
| `--comark-accent` | The hovered Copy button |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners of screenshots and notes |
| `--comark-font` | Stamp numbers, the status after a copy |

## Variables

Set them on `.ca`, the root of every block:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ca-color` | `var(--ca-blue)` | Marks, arrows, and notes without a `color` |
| `--ca-solid` | `var(--ca-blue-solid)` | Their stamps, and their strokes in dark mode |
| `--ca-ink` | `var(--ca-blue-ink)` | The number on their stamps |
| `--ca-red` to `--ca-gray` | `#ee3533`, `#f5a524`, `#259f56`, `#0581e6`, `#71717a`, lighter in dark mode | Marks, arrows, and notes in red, amber, green, blue, and gray |
| `--ca-red-solid` to `--ca-gray-solid` | `#d01d21`, `#f59e0b`, `#037e3f`, `#0267c7`, `#52525b` | Stamps in each named color, and its strokes in dark mode |
| `--ca-red-ink` to `--ca-gray-ink` | `#fff`, and `#1c1917` for amber | The number on a stamp in each named color |
| `--ca-ring` | `--comark-background` | The ring that parts a stamp from the screenshot |
| `--ca-note-font` | `comark-caveat, cursive` | Side notes and titles. `inherit` uses the page font. |
| `--ca-note-size` | `1.25em` | Side notes |
| `--ca-label-size` | `1.5em` | A screenshot's title |
| `--ca-gutter` | `10rem` | The room beside the image for `side="left"` and `side="right"` notes |
| `--ca-top-gutter` | `5rem` | The room above the image for `side="top"` notes |
| `--ca-gap` | `1.25rem` | The space between a side note and the image, where its arrow runs |

An annotation's `color` sets `--ca-color`, `--ca-solid`, and `--ca-ink` on its own mark and note, so it wins over `.ca`. Caveat comes inlined with the styles, about 32 KB once per page.

## Classes

- Every block sits in a `.ca`: a screenshot's `figure.ca-screenshot` inside it, and `.ca.ca-compare` for a compare (plus `.ca-slider` with `mode="slider"`).
- A screenshot holds `.ca-heading` with its title in `.ca-label`, then `.ca-stage` with the image in `.ca-frame`, and a `figcaption` with the notes in `ol.ca-notes`. It has `.ca-left`, `.ca-right`, or `.ca-top` when it has side notes there.
- A mark is a `.ca-mark` with its shape as a class, such as `.ca-box` or `.ca-circle`, and its number in `.ca-stamp`. A side note is a `.ca-callout` with its arrow in `.ca-arrow`. A mark, its arrow, and its note share a `data-n`.
- The Copy button is `.ca-copy`. A slider's divider is `.ca-handle`, with its knob in `.ca-grip`.

```css
.ca {
  --ca-color: #0070f3;
  --ca-solid: #0070f3;
  --ca-ink: #fff;
  --ca-note-font: inherit;
}
```

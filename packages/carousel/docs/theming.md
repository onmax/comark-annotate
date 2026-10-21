---
title: Theming
description: The shared tokens, the carousel's own variables for gaps, slide panels, and arrows, and the classes a page can target.
---

The arrows, counter, and slide panels follow the shared tokens in [Theming](/guide/theming/), and four variables of its own set the space and the sizes. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The arrows' faces |
| `--comark-foreground` | The arrows' icons, and the tint of the slide panels |
| `--comark-muted` | The counter |
| `--comark-border` | The arrows' borders |
| `--comark-accent` | Hovered arrows |
| `--comark-ring` | The focus ring on the arrows |
| `--comark-radius` | The slide panels' corners |

The zoomed view comes from comark-zoom and has a [Theming page](/zoom/theming/) of its own.

## Variables

Set these on `.cc` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cc-gap` | `1rem` | The space between slides |
| `--cc-surface` | `--comark-foreground` at 4% | The panel behind each slide |
| `--cc-padding` | `1rem` | The space inside each panel, halved on a narrow page |
| `--cc-button-size` | `2rem` | The arrows' width and height, at least `2.5rem` on touch screens |

Each slide sits on a soft panel as tall as the tallest one, so slides of different heights line up. To drop the panel, set `--cc-surface: transparent` and `--cc-padding: 0`.

## Classes and attributes

| Selector | Is |
| --- | --- |
| `.cc` | The carousel, with `data-carousel-columns` when it shows 2 or 3 at a time, and `data-carousel-fits` when every slide fits at once |
| `.cc-track` | The row that scrolls |
| `.cc-slide` | Each slide |
| `.cc-controls` | The row under the slides, shown once the script runs |
| `.cc-count` | The position, such as `1 / 3` |
| `.cc-step` | An arrow, with `aria-disabled="true"` at either end |
| `[data-carousel-ready]` | On `<html>` once the script runs; without it the track shows its scrollbar instead of arrows |

## Example

Wider gaps, no panels, and bigger arrows:

```css
:root {
  --cc-gap: 2rem;
  --cc-surface: transparent;
  --cc-padding: 0;
  --cc-button-size: 2.5rem;
}
```

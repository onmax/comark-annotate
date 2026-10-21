---
title: Theming
description: The series colors, the card's padding, and the classes a chart's parts carry.
---

A chart is a card in the style of [shadcn/ui](https://ui.shadcn.com), so it switches with the page's dark mode. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Charts read these [shared tokens](/guide/theming/), and their series read shadcn/ui's chart colors:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-foreground` | `--foreground` | Values, the caption, the data table |
| `--comark-muted` | `--muted-foreground` | Axis labels, the **Data** toggle, waterfall totals |
| `--comark-border` | `--border` | The card, grid lines, and the data table's rules |
| `--comark-background` | `--background` | The card, and the edges between slices and around points |
| `--comark-ring` | `--ring` | The focus ring on the **Data** toggle |
| `--comark-radius` | `--radius` | The card's corners |
| `--comark-font` | `--font-sans` | All text |
| `--comark-chart-1` to `-6` | `--chart-1` to `-6` | Series, in column order |

Without either, series use six colors that read on light and dark pages: blue, orange, green, purple, rose, and yellow. A waterfall's increases and decreases are series 3 and 5.

## Variables

| Variable | Default | Used for |
| --- | --- | --- |
| `--cch-padding` | `1.5rem` | The space inside the card's sides. The **Data** footer runs to the card's edges, so it follows. |

Marks on a chart use comark-annotate's styles, and its [variables](/annotate/theming/) for their colors.

## Classes

A chart is a `figure.cch` with `data-type`, such as `data-type="bar"`, holding a `figcaption`, the SVG in `.cch-plot`, and the table in `details.cch-data` as its footer. A chart with marks adds `.cch-marked` to `.cch-plot`.

```css
:root {
  --comark-chart-1: oklch(0.65 0.2 250);
}

.cch {
  --cch-padding: 1rem;
}
```

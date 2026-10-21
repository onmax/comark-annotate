---
title: Guides
description: Validation, theming, chart size, and renderers.
---

## Validation

The plugin checks every chart while parsing and adds the problems to `meta.issues`, so you can reject a document before publishing it:

```ts
import { parseMarkdown } from "comark";
import charts from "comark-charts";

const { meta } = await parseMarkdown(markdown, { plugins: [charts()] });
if (meta.issues.length) throw new Error(meta.issues.join("\n"));
```

Each issue names its chart by its position in the document and says how to fix it:

```txt
`::chart` 2: row 3 has `41 kB` in `size`, which isn't a number. Write the number alone, such as `1200` or `1,200`, and put the unit in the header, such as `size (ms)`.
```

It reports unknown props and types, columns that `x` or `y` name but the table doesn't have, cells that aren't numbers, tables without rows or with unnamed or repeated columns, an x value that appears twice, content besides the table and its annotations, and data that doesn't fit the type: a line or an area of one row, a scatter without numbers on x, a dumbbell with one column, a pie or a waterfall with several, and a pie with a negative number or nothing but zeros.

Annotations are checked too: a missing or unknown `at`, a `series` the chart doesn't draw, and the mark, color, and side, as comark-annotate checks them on screenshots.

Rendering never throws. A cell that isn't a number is left out, a mark it can't place is left out, a type that doesn't fit falls back to the default, a pie or a waterfall draws its first column, and a chart with nothing to draw shows its content as it is. [comark-linter](/lint/) reports the same issues with their line numbers.

## Theming

The styles follow [shadcn/ui](https://ui.shadcn.com) and the shared `--comark-*` tokens, like the other plugins, so a chart switches with the page's dark mode:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-foreground` | `--foreground` | Values and the caption |
| `--comark-muted` | `--muted-foreground` | Axis labels, the **Data** toggle, waterfall totals |
| `--comark-border` | `--border` | Grid lines and the data table's rules |
| `--comark-background` | `--background` | The edges between slices and around points |
| `--comark-font` | `--font-sans` | All text |
| `--comark-chart-1` to `-6` | `--chart-1` to `-6` | Series, in column order |

Without either, series use six colors that read on light and dark pages: blue, orange, green, purple, rose, and yellow. A waterfall's increases and decreases are series 3 and 5.

```css
:root {
  --comark-chart-1: oklch(0.65 0.2 250);
}
```

The rules sit in a `comark` CSS layer, so any plain rule of your own wins. A chart is a card, a `figure.cch` with `data-type`, holding a `figcaption`, the SVG in `.cch-plot`, and the table in `details.cch-data` as its footer. Marks use comark-annotate's styles and colors.

## Size

A chart keeps the size its text was set for, sized to fit its card with room for its labels, rather than stretching to the column, so labels read the same in every chart. Values sit on the marks when they fit; on crowded or stacked bars, or with negative numbers, the value axis reads them instead. Lines name their series at their ends unless the ends sit close together, and then a legend does. No row is ever dropped: a long sideways chart grows taller. A narrower column scrolls it sideways, and print shrinks it to the page. A chart with marks shrinks to fit instead, since its marks sit at percentages of the chart.

## Renderers

Only `@comark/html` has a renderer, `comark-charts/html`, which inlines the styles once per document. Vega draws on the server, and a Vue, React, or Svelte component would ship it to the browser. Charts are static: there are no tooltips, and the **Data** table holds every number.

---
title: Guides
description: Validation, chart size, and renderers.
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

It reports:

- Unknown props and types.
- Columns that `x` or `y` name but the table doesn't have.
- Cells that aren't numbers.
- Tables without rows, or with unnamed or repeated columns.
- An x value that appears twice.
- Content besides the table and its annotations.
- Data that doesn't fit the type, such as a line or an area of one row, a scatter without numbers on x, a dumbbell with one column, a pie or a waterfall with several, and a pie with a negative number or nothing but zeros.

Annotations are checked too: a missing or unknown `at`, a `series` the chart doesn't draw, a mark on an empty cell, and the mark, color, and side, as comark-annotate checks them on screenshots.

Rendering never throws. A chart with a problem draws what it can:

- A cell that isn't a number is left out, and so is a mark the plugin can't place.
- A type that doesn't fit falls back to the default.
- A pie or a waterfall draws only its first column.
- A chart with nothing to draw shows its content as it is.

[comark-linter](/lint/) reports the same issues with their line numbers. Each one has its own rule in [Doctor](/doctor/).

## Size

A chart keeps the size its text was set for instead of stretching to the column, so labels read the same in every chart. It's sized to fit its card, with room for its labels.

- Values sit on the marks when they fit. On crowded or stacked bars, or with negative numbers, you read them off the value axis instead.
- Lines name their series at their ends. When the ends sit close together, a legend names them.
- No row is ever dropped. A long sideways chart grows taller.
- A narrower column scrolls the chart sideways, and print shrinks it to the page. A chart with marks shrinks to fit instead, since its marks sit at percentages of the chart.

## Renderers

The parse plugin draws every chart, so Vega runs where you parse, on the server or at build time, and never in the browser. Each renderer only places the SVG it wrote:

| Renderer | Entry |
| --- | --- |
| `@comark/html` | `comark-charts/html`, which inlines the styles once per document |
| `@comark/vue` | `comark-charts/vue` |
| `@comark/react` | `comark-charts/react` |
| `@comark/svelte` | `comark-charts/svelte` |

The Vue, React, and Svelte components add the styles when they mount. When you render on a server, import `comark-charts/style.css` with your own styles so the page doesn't shift.

Marks come from comark-annotate, which renders only to HTML, so the other renderers draw the chart without them.

Charts are static. They have no tooltips, and the **Data** table holds every number. To check documents without drawing them, as comark-linter does, pass `charts({ draw: false })`.

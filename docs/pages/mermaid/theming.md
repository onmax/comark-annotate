---
title: Theming
description: The card a diagram sits on, the tokens it reads, and Pele's variables.
---

Through [@onmax/comark](/preset/), each diagram sits on a card in a 1px frame, and Pele paints it with the page's colors, so it follows light and dark like the other blocks without being drawn again. The rules sit in a `comark` CSS layer, so any plain rule of your own wins. comark-pele alone draws with Pele's own colors; add `mermaidCss` from `@onmax/comark/client` to the page for these.

## Shared tokens

Diagrams read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The card and the diagram's background |
| `--comark-foreground` | Text and node labels |
| `--comark-muted` | Lines, arrows, and secondary text |
| `--comark-accent` | Node fills |
| `--comark-border` | Node borders and the card's frame |
| `--comark-radius` | The card's corners, and a little less on nodes |
| `--comark-font` | Every label |

Pie and xy charts color their series with `--comark-chart-1` to `--comark-chart-8`, then shadcn's `--chart-*`, like [charts](/charts/theming/).

## Variables

Pele paints with its `--pele-*` variables, which the card sets from the tokens. Set one on `.pele-diagram` to change a single color, such as `--pele-accent` for highlighted nodes. [Pele's theming](https://pele.run/theming) lists them all.

## Classes

A diagram is `div.pele-diagram`, with `data-diagram` set to its type, such as `flowchart` or `pie`, and the SVG inside it is `svg.pele`. A diagram that failed has `data-error` and shows its source in `pre.pele-source`.

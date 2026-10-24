---
title: Theming
description: The card a diagram sits on, the tokens it reads, and its classes.
---

Each diagram sits on a card in a 1px frame with its title under it. The card stays white on a dark page, since diagram tools draw dark lines on white whatever the page's theme. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Diagrams read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-muted` | The title under a diagram |
| `--comark-border` | The card's frame |
| `--comark-radius` | The card's corners |
| `--comark-font` | The title |

## Variables

| Variable | Default | Used for |
| --- | --- | --- |
| `--cdg-canvas` | `#fff` | The card behind a diagram. Set it on `.cdg` for a tool whose theme draws light lines. |

## Classes

A diagram is `figure.cdg`, with `data-type` set to its Kroki type, such as `d2` or `graphviz`. The drawing sits in `.cdg-svg`, and its title in `figcaption`.

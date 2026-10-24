---
title: Theming
description: The tokens and classes of tables, their copy buttons, and sortable headers.
---

A table scrolls sideways in place, with its copy buttons in a bar above it, in the style of shadcn/ui's outline buttons. Sortable headers read as plain header text, with an arrow once the script runs. The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the reset that keeps a sortable header from taking a page's `button` styles.

## Shared tokens

Tables read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The copy buttons |
| `--comark-foreground` | A hovered copy button's text |
| `--comark-muted` | The copy buttons' text, the status after a copy, an unsorted header's arrow |
| `--comark-border` | The copy buttons' outline |
| `--comark-accent` | A hovered copy button |
| `--comark-ring` | Focus rings |
| `--comark-radius` | The copy buttons' corners |
| `--comark-font` | The bar |

The table itself takes the page's own table styles.

## Colors

A cell with a `tone` carries its tint in its own `style`, a 20% mix of its color into transparent, so it colors any table, inside a `::table` or not, with no stylesheet. Set the colors with Nuxt UI's tokens, which comark-badge reads too:

| Token | Tone | Default |
| --- | --- | --- |
| `--ui-success` | `success` | `#16a34a` |
| `--ui-warning` | `warning` | `#ca8a04` |
| `--ui-error` | `error` | `--destructive`, then `#dc2626` |
| `--ui-info` | `info` | `#2563eb` |

## Classes

| Class | Element |
| --- | --- |
| `.ctb` | The block around a table |
| `.ctb-bar` | The bar above it, with `.ctb-status` and the `button[data-table-copy]` buttons |
| `.ctb-scroll` | The frame the table scrolls in |
| `.ctb-sort` | A sortable header's button; its `th` carries `aria-sort` once sorted |

---
title: Guides
description: Accordions on one page, the nodes it writes, and theming.
---

## Accordions on one page

A `type="single"` accordion names its items from a hash of the document and the accordion's position, so two accordions on one page, or two documents rendered into one page, never close each other's items. The name stays the same every time a document renders, so server and client output match.

## Your own renderer

Every block becomes a `disclosure` node, drawn as `<details>`, whose first child is a `disclosure-summary`, drawn as `<summary>`, holding the label. An accordion becomes an `accordion` node of disclosures:

```json
["accordion", {},
  ["disclosure", { "variant": "item", "name": "cdt-1x2y3z-1", "open": "true" },
    ["disclosure-summary", { "icon": { "src": "data:image/svg+xml,…" } }, "Is it free?"],
    "Yes."]]
```

`variant` is `details`, `item`, or `collapsible`. A collapsible's summary also has `show` and `hide`, the words before its label.

## Theming

Details and accordions are bordered boxes with a chevron that turns as they open; a collapsible is a quiet line of text. Each is a `<details class="cdt">` with `data-variant`, and an accordion wraps its items in `<div class="cdt-accordion">`. They read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The boxes |
| `--comark-foreground` | Summaries |
| `--comark-muted` | Chevrons, icons, a collapsible's summary |
| `--comark-border` | Boxes, the lines between accordion items |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners |
| `--comark-font` | Summaries |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the spacing that draws each box: the padding of `.cdt` and its summary, the margins between accordion items, and the edge margins of a box's content are `!important`, because a page's own `details`, `summary`, and paragraph rules are almost always unlayered and would pull the summary out of line or split an accordion. Override those with `!important` too.

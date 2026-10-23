---
title: Guides
description: Link cards, the nodes it writes, and theming.
---

## Link cards

A card with `to` is drawn as Nuxt UI draws it: an empty link stretched over the card, named by the card's title, followed by the card's content. The card reads as one link to a screen reader, its text stays selectable, and links inside it stay on top of the stretched one, so they open on their own.

Links to other sites open in a new tab with `rel="noopener noreferrer"` and an arrow in the corner. Set `target="_self"` to keep them in the tab.

## Your own renderer

The parse plugin replaces each card's attributes with the ones it renders from, puts its title in a `card-title` node, and wraps each cell of `::columns` in a `column` node:

```json
["card", { "color": "primary", "to": "/guide", "label": "Docs", "icon": { "src": "data:image/svg+xml,…" } },
  ["card-title", {}, "Docs"],
  "Read it."]
```

`external` is set when the link opens in a new tab, and `label` is the link's name: the title's text, or "Card link".

## Theming

A card is a `<div class="ccr" data-color="...">`, a group a `<div class="ccr-group">`, and columns a `<div class="ccr-columns" data-cols="...">` of `<div class="ccr-column">`. Each color reads Nuxt UI's variable, such as `--ui-primary`, then its own default; set `--ccr-primary` and the others on `.ccr` to change one. Cards also read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | Cards |
| `--comark-foreground` | Titles |
| `--comark-muted` | Text, the arrow on external cards |
| `--comark-border` | Cards |
| `--comark-accent` | A hovered link card |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners |
| `--comark-font` | Text |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

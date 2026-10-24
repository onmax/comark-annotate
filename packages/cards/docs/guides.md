---
title: Guides
description: Link cards, the nodes it writes, and theming.
---

## Link cards

A card with `to` renders the way Nuxt UI renders it. An empty link, named by the card's title, stretches over the card, and the card's content follows it. A screen reader reads the card as one link, and its text stays selectable. Links inside it sit on top of the stretched one, so they open on their own.

Links to other sites open in a new tab with `rel="noopener noreferrer"` and an arrow in the corner. Set `target="_self"` to keep them in the tab.

## Your own renderer

The parse plugin replaces each card's attributes with the ones it renders from, puts its title in a `card-title` node, and wraps each cell of `::columns` in a `column` node:

```json
["card", { "color": "primary", "to": "/guide", "label": "Docs", "icon": { "src": "data:image/svg+xml,…" } },
  ["card-title", {}, "Docs"],
  "Read it."]
```

The plugin sets `external` when the link opens in a new tab. `label` is the link's name, which is the title's text or "Card link".

## Theming

A card is a `<div class="ccr" data-color="...">`, with `data-variant="soft"` or `data-variant="subtle"` when it has one. A group is a `<div class="ccr-group">`, and columns are a `<div class="ccr-columns" data-cols="...">` of `<div class="ccr-column">`.

Each color reads Nuxt UI's variable, such as `--ui-primary`, then its own default. Primary falls back to shadcn/ui's `--primary`, then to the foreground, so cards match the page's brand color, or stay neutral without one. Set `--ccr-primary` and the others on `.ccr` to change one. The `soft` and `subtle` variants mix 10% of the color into `--comark-background` for the card's background, and `subtle` 30% for its border, so they read in light and dark themes alike.

Cards also read these [shared tokens](/guide/theming/):

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

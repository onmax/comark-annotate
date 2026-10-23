---
title: Theming
description: The height of apps, the width of Shorts, and the classes of players and cards.
---

Players sit in a bordered frame with their link under it. Cards follow shadcn/ui's Item, with a globe, the title, and the host. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Players and cards read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | Cards |
| `--comark-foreground` | A card's title, the hovered link under a player, the tint behind a loading player |
| `--comark-muted` | The link under a player, a card's host and globe |
| `--comark-border` | The player's frame, cards |
| `--comark-accent` | The hovered card, the globe's tile |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners of frames and cards |
| `--comark-font` | The link under a player, cards |

## Variables

Set them on `.ce`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ce-app-height` | `30rem` | The height of CodePen, StackBlitz, and Figma |
| `--ce-short-width` | `20rem` | The widest a YouTube Short gets, centered |

Videos keep 16:9 and Shorts 9:16 at any width. Spotify draws its own card at fixed heights, so its players have no frame.

## Classes

A player is a `figure.ce` with `data-provider`, such as `data-provider="youtube"`, and `data-size`: `video`, `short`, `compact`, `list`, or `app`. It holds `.ce-frame` with the iframe, and a `figcaption` with the link. A card is an `a.ce-card` holding a globe, the title in `strong`, and the host in `span`.

```css
.ce {
  --ce-app-height: 40rem;
  --ce-short-width: 16rem;
}
```

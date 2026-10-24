---
title: Guides
description: Review a theme change, and size or restyle the swatches.
---

## Review a theme change

A pull request that changes design tokens reads best with the old and new values side by side. Write them in inline code and each one shows its color:

```md
| Token | Before | After |
| --- | --- | --- |
| `--primary` | `#3b82f6` | `oklch(0.55 0.2 264)` |
| `--ring` | `#93c5fd` | `oklch(0.7 0.12 260)` |
```

For the whole set, a `::palette` per theme shows them as a reviewer would see them on a page.

## Theming

Swatches and tiles read the [shared tokens](/guide/theming/): `--comark-border` for their outlines, `--comark-background` and `--comark-foreground` for a tile's card, `--comark-muted` for its value and, mixed with `--comark-background`, the checkerboard under a translucent color, `--comark-radius` for its corners, and `--comark-font` for its name. The value is in the system's monospace font. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Variable | Default | Used for |
| --- | --- | --- |
| `--cco-tile-width` | `9rem` | The narrowest a palette's tile gets before the grid wraps |
| `--cco-tile-height` | `4rem` | The height of a tile's color |

| Class | Element |
| --- | --- |
| `.cco` | Inline code that holds a color |
| `.cco-swatch` | The swatch before it, with its color in `--cco` |
| `.cco-palette` | A palette's list |
| `.cco-tile` | A tile's color, in `--cco` |
| `.cco-name`, `.cco-value` | A tile's name and value |

Swatches print with their colors, since a swatch is nothing but its background.

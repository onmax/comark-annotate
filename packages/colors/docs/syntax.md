---
title: Syntax
description: The colors comark-colors reads, and ::palette.
---

## Inline code

```md
Links use `#3b82f6`, and visited ones `oklch(0.5 0.2 300 / 90%)`.
```

Inline code that holds one color and nothing else gets a swatch before it. Code blocks are left alone, and so is inline code with anything else in it, such as `` `color: #fff` ``.

| Form | Examples |
| --- | --- |
| Hex | `#fff`, `#ffff`, `#3b82f6`, `#3b82f680` |
| `rgb()`, `rgba()` | `rgb(59 130 246)`, `rgb(59 130 246 / 50%)`, `rgba(59, 130, 246, .5)` |
| `hsl()`, `hsla()`, `hwb()` | `hsl(217deg 91% 60%)`, `hwb(217 23% 4%)` |
| `lab()`, `lch()`, `oklab()`, `oklch()` | `lab(54.6 8.6 -65.7)`, `oklch(0.62 0.19 260)` |

Named colors such as `red` aren't read, since a word in code is far more often a name in a program than a color. Nor are `var()`, `color()`, and `color-mix()`, whose color depends on the page.

## Palette

```md
::palette
- Primary: `#3b82f6`
- Danger: #dc2626
::
```

A `::palette` holds one list, bulleted or numbered, of `name: color` lines, and draws each as a tile with its name and its value. The color can be in inline code or not. Close the block with `::`.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a palette with no list, content beside the list (it's dropped), a line with no name or color, a color it can't draw (the line is left out), and a prop, which a palette doesn't have. Each issue names its palette and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

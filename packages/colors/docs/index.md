---
title: comark-colors
description: Color swatches next to inline code and palettes of named colors, written in Markdown.
keywords: color swatch, swatch, hex, rgb, hsl, oklch, palette, design tokens, color preview
tagline: Write a color in inline code and readers see it, as GitLab shows it. Put named colors in a palette and get a grid of swatches.
install: pnpm add comark @comark/html comark-colors
group: Review blocks
icon: palette
blurb: Swatches for colors in code
credits: 'After <a href="https://docs.gitlab.com/user/markdown/#colors">GitLab</a>''s color chips and <a href="https://www.mintlify.com/docs/components/color">Mintlify</a>''s Color.'
---

::examples
:::example{label="Inline"}
```md
The button moves from `#3b82f6` to `oklch(0.55 0.2 264)`, and its hover from `rgb(37 99 235)` to `hsl(226 71% 40%)`.
```
:::

:::example{label="Palette"}
```md
::palette
- Background: `#fafaf9`
- Foreground: `#1c1917`
- Primary: `oklch(0.55 0.2 264)`
- Danger: `#dc2626`
- Overlay: `rgb(0 0 0 / 40%)`
::
```
:::
::

There's no new syntax for a single color: any inline code that holds exactly one hex, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, or `oklch()` color gets a swatch before it, and the document still reads the same without the plugin. A swatch sits on a checkerboard, so a translucent color shows as translucent.

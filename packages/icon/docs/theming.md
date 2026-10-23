---
title: Theming
description: The icon's size, its color, and the class and attributes it carries.
---

An icon is a `.ci` the height of the text, `1em`, and as wide as its shape. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Variables

Icons don't read the [shared tokens](/guide/theming/). An icon in one color paints in `currentColor`, so it takes the color of the text around it. One with colors of its own, such as a logo, keeps them.

| Variable | Default | Used for |
| --- | --- | --- |
| `--comark-icon-size` | `1em` | The height of every icon, in text and in tabs. Its width follows its shape. |

Set it on any ancestor, such as `.prose`, or on `.ci` itself.

## Classes

An icon is a `span.ci`. An icon in one color has `data-mask`, so `color` recolors it. Its image is in `--ci`, and an icon that isn't square has its width over its height in `--ci-ratio`. The plugin sets both on the icon's `style`, so leave them be. In forced colors, such as Windows High Contrast, an icon in one color takes the system's text color.

Each icon carries its image in an inline `style`, so a [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) needs `style-src-attr 'unsafe-inline'` and `img-src data:`.

```css
.prose {
  --comark-icon-size: 1.25em;
}

.prose .ci[data-mask] {
  color: var(--muted-foreground);
}
```

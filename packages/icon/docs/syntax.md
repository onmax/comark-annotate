---
title: Syntax
description: The icon component, its names, and how to style it.
---

```md
:icon{name="lucide:apple"}
:icon{name="lucide:apple" label="Apple"}
```

| Prop | |
| --- | --- |
| `name` | An icon: `set:name`, such as `lucide:apple`, or the URL of an image. Required. Browse the sets at [icones.js.org](https://icones.js.org). |
| `label` | What the icon means, for screen readers. Without one, the icon is decoration and they skip it. |

Give a `label` when the icon carries meaning the text around it doesn't, such as a lone status icon; leave it out when a word next to it says the same.

## Names

Write `set:name`. Nuxt UI's `i-lucide-apple` and `i-lucide:apple` work too, so Markdown written for Nuxt UI renders the same. A name can be bound to the front matter, as `:icon{:name="frontmatter.icon"}`.

## Styling

An icon is a `.ci` the height of the text, `1em`, and as wide as its shape. Set `--comark-icon-size` to change it:

```css
.prose {
  --comark-icon-size: 1.25em;
}
```

An icon in one color has `data-mask` and paints in `currentColor`, so `color` recolors it. Its image is in `--ci`. The rules sit in a `comark` CSS layer, so any plain rule of your own wins. In forced colors, such as Windows High Contrast, an icon in one color takes the system's text color.

Each icon carries its image in an inline `style`, so a [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) needs `style-src-attr 'unsafe-inline'` and `img-src data:`.

---
title: Theming
description: The variables and class names that change how chips look.
---

## Tokens

Chips take their colors from the shared tokens in [Theming](/guide/theming/), so a site that themes the other plugins themes chips too. A favicon chip is a faint tint of `--comark-foreground` with a hairline ring of it, so it reads on a page, a card, or a callout without a color of its own. A focused chip draws its outline in `--comark-ring`.

## Variables

Set these on `:root`, or on any ancestor to change the chips inside it only:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cp-background` | `--comark-foreground` at 3.5% | A favicon chip's fill |
| `--cp-hover` | `--comark-foreground` at 7% | A favicon chip's fill under the pointer |
| `--cp-ring` | `--comark-foreground` at 8% | The hairline around a favicon chip |
| `--cp-color` | The text's color | The chip's text |
| `--cp-font-weight` | `500` | The chip's text |
| `--cp-radius` | `0.375em` | A favicon chip's corners |
| `--cp-image-size` | `1em` | The favicon or avatar |

```css
:root {
  --cp-background: oklch(0.95 0.03 250);
  --cp-ring: transparent;
  --cp-radius: 999px;
}
```

## Class names

A chip is an `a.cp` with `data-kind="favicon"` or `data-kind="avatar"`, holding an `img.cp-img` and its text. A favicon chip sits in a faint pill with its favicon, square with rounded corners. An avatar chip, such as a mention, is only its round avatar and the name, with no pill, and underlines under the pointer. Target these for anything the variables don't cover:

```css
.cp[data-kind="avatar"] .cp-img {
  outline: 2px solid var(--comark-background);
}
```

The rules sit in a `comark` CSS layer, so a plain rule of your own wins without `!important`.

---
title: Theming
description: The shared tokens, the button bar's own variables, and the classes a page can target.
---

The buttons follow the shared tokens in [Theming](/guide/theming/), and two variables of their own place the bar and size its buttons. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them. Wrap's rule is the one outside the layer, so it beats a page's own `white-space`.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The buttons' faces, and the status line's text |
| `--comark-foreground` | The buttons' icons and labels, and the status line's background |
| `--comark-border` | The buttons' borders |
| `--comark-accent` | Hovered buttons, and Wrap while it's on |
| `--comark-ring` | The focus ring on the buttons |
| `--comark-radius` | The buttons' and the status line's corners |
| `--comark-font` | Action labels and the status line |

## Variables

Set these on `.ck` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ck-inset` | `0.5rem` | How far the bar sits from the block's top right corner |
| `--ck-button-size` | `1.75rem` | The buttons' height and least width, at least `2.25rem` on touch screens |

## Classes and attributes

| Selector | Is |
| --- | --- |
| `.ck` | The wrapper around each block, with `data-code-wrap` while Wrap is on |
| `.ck-bar` | The row of buttons, shown on hover and focus, and always on touch screens |
| `.ck-action` | Each of your [actions](/code/guides/#actions), with its id in `data-code-action` |
| `.ck-wrap` | Wrap, with `aria-pressed="true"` while it's on |
| `.ck-copy` | Copy, with `data-state="done"` or `data-state="failed"` for a moment after a click |
| `.ck-status` | The line under the bar that says what Copy did |
| `[data-code-ready]` | On `<html>` once the script runs; the bar hides until then |

## Example

Bigger buttons further from the corner, always shown:

```css
:root {
  --ck-inset: 0.75rem;
  --ck-button-size: 2rem;
}

.ck-bar {
  opacity: 1;
}
```

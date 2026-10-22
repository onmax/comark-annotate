---
title: Theming
description: The shared tokens, the header's own variables, and the classes a page can target.
---

The header sits on the code block's own background, so it takes your `pre` styles and Shiki's theme. The title and buttons follow the shared tokens in [Theming](/guide/theming/); two variables of their own size the buttons and the header, and a third sets the title's font. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them. Two rules sit outside it, so they beat a page's own `pre` styles: the `padding-top` that makes room for the header above the first line, and Wrap's `white-space`.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-muted` | The title, and the buttons' icons and labels |
| `--comark-foreground` | Hovered buttons' icons and labels, and the status line's background |
| `--comark-background` | The status line's text |
| `--comark-accent` | Hovered buttons, and Wrap while it's on |
| `--comark-ring` | The focus ring on the buttons |
| `--comark-radius` | The buttons' and the status line's corners |
| `--comark-font` | Action labels and the status line |

## Variables

Set these on `.ck` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ck-inset` | `0.375rem` | How far the buttons sit from the block's top right corner, and the gap under them |
| `--ck-button-size` | `1.5rem` | The buttons' height and least width, at least `2.25rem` on touch screens |
| `--ck-title-font` | `ui-monospace, SFMono-Regular, Menlo, monospace` | The title. Set it to your code's font so the title matches the block. |

The header is the button size plus the inset above and below, and the block's `padding-top` matches it.

## Classes and attributes

| Selector | Is |
| --- | --- |
| `.ck` | The wrapper around each block, with `data-code-wrap` while Wrap is on |
| `.ck-bar` | The header above the code: the title, then the buttons |
| `.ck-title` | The file's name, or else the language; hidden inside a code group, whose tab names the block |
| `.ck-action` | Each of your [actions](/code/guides/#actions), with its id in `data-code-action`, and `aria-label` when it shows only an icon |
| `.ck-wrap` | Wrap, with `aria-pressed="true"` while it's on |
| `.ck-copy` | Copy, with `data-state="done"` or `data-state="failed"` for a moment after a click |
| `.ck-status` | The line under the header that says what Copy did |
| `[data-code-ready]` | On `<html>` once the script runs; the buttons hide until then, and the title doesn't |

## Example

Bigger buttons further from the corner, and a title in the code's font, lined up with code that has `1.25rem` of side padding:

```css
:root {
  --ck-inset: 0.5rem;
  --ck-button-size: 1.75rem;
  --ck-title-font: "JetBrains Mono", monospace;
}

.ck-bar {
  padding-left: 1.25rem;
}
```

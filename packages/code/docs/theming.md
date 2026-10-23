---
title: Theming
description: The shared tokens, the header's own variables, and the classes a page can target.
---

The header sits on the code block's own background, so it takes your `pre` styles and Shiki's theme. The title and buttons follow the shared tokens in [Theming](/guide/theming/); two variables of their own size the buttons and the header, and a third sets the title's font. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them. A few rules sit outside it, so they beat a page's own `pre` styles: the `padding-top` that makes room for the header above the first line, the `overflow-x` that clips a marked line's tint, and Wrap's `white-space`. A collapsed range's margins, padding, and border are `!important`, so a page's own `details` and `summary` styles can't push it off the lines.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-muted` | The title, the buttons' icons and labels, line numbers, a collapsed range's line, and a terminal's dots |
| `--comark-foreground` | Hovered buttons' icons and labels, the status line's background, and the tint of `mark` lines, highlighted words, and collapsed ranges |
| `--comark-background` | The status line's text |
| `--comark-border` | The line under a terminal's header |
| `--comark-accent` | Hovered buttons, and Wrap while it's on |
| `--comark-ring` | The focus ring on the buttons and on a collapsed range |
| `--comark-radius` | The buttons', the status line's, and highlighted words' corners |
| `--comark-font` | Action labels and the status line |

## Variables

Set these on `.ck` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ck-inset` | `0.375rem` | How far the buttons sit from the block's top right corner, and the gap under them |
| `--ck-button-size` | `1.5rem` | The buttons' height and least width, at least `2.25rem` on touch screens |
| `--ck-title-font` | `ui-monospace, SFMono-Regular, Menlo, monospace` | The title. Set it to your code's font so the title matches the block. |
| `--ck-green` | `#259f56`, `#59d38c` in dark mode | Lines marked `ins`, and their `+` |
| `--ck-red` | `#ee3533`, `#fd736d` in dark mode | Lines marked `del`, and their `−`, and Shiki's errors |
| `--ck-yellow` | `#d49b00`, `#f5c84b` in dark mode | Shiki's warnings |

The dark shades follow the system's dark mode, or a `.dark` class on any ancestor, and a `.light` class keeps the light ones.

The header is the button size plus the inset above and below, and the block's `padding-top` matches it. A marked line is tinted from edge to edge, past the block's padding, so the block clips its overflow. Its sign sits in the block's left padding, which needs to be at least `1.5ch` wide; on a numbered block it sits between the number and the code.

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
| `[data-code-frame="terminal"]` | On `.ck` when the block is a terminal: dots on the left of the header, and the title in its middle |
| `[data-code-lines]` | On `.ck` when the lines are blocks of their own: the block marks, numbers, or folds lines, or Shiki's transformers mark them |
| `[data-code-numbers]` | On `.ck` when the lines are numbered, with the widest number's digits as its value; each line's number is in `data-line` |
| `.ck-ins`, `.ck-del`, `.ck-mark` | Lines the fence marks with `ins`, `del`, and `mark`. A line Comark's `{2}` highlights has `.highlight`, and Shiki's transformers' `.diff.add`, `.diff.remove`, `.highlighted`, `.focused`, `.error`, and `.warning` look the same as the matching marker |
| `.ck-fold` | A collapsed range: a `<details>` whose `<summary>` counts its lines |
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

To try it, paste it into Extra CSS in the [playground's Theme pane](/play/#preset=code-copy-and-wrap).

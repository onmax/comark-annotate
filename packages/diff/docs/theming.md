---
title: Theming
description: The shared tokens, the diff's own colors and font, and the classes a page can target.
---

A diff is a card in the style of shadcn/ui's Card, so it follows the shared tokens in [Theming](/guide/theming/) and turns dark with them. Removed and added lines take their own red and green, which mean something in any theme. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The card |
| `--comark-foreground` | The code, and mixed into the red and green of the counts and markers so they stay readable |
| `--comark-muted` | The icon, the file's name, and the line numbers |
| `--comark-border` | The card's edge and the line under the header |
| `--comark-accent` | The header, half and half with the background |
| `--comark-ring` | The focus ring on the code, and the bar beside a highlighted line |
| `--comark-radius` | The card's corners |
| `--comark-font` | The header's label |

With Comark's `shiki` plugin, the code's colors are Shiki's.

## Variables

Set them on `.cd`, the root of every diff:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cd-red` | `#ee3533`, `#fd736d` in dark mode | Removed lines, their numbers and `−`, the removed words, and the count of removed lines |
| `--cd-green` | `#259f56`, `#59d38c` in dark mode | Added lines, their numbers and `+`, the added words, and the count of added lines |
| `--cd-font` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | The code, the file's name, and the counts |

Lines take a tint of each color, the changed words a deeper one. The dark shades follow the system's dark mode, so a site that turns dark with a `.dark` class sets them too: `.dark .cd { --cd-red: #fd736d; --cd-green: #59d38c }`.

## Classes and attributes

| Selector | Is |
| --- | --- |
| `figure.cd` | The card |
| `.cd > figcaption` | The header: the icon, the label, the file, and the counts |
| `.cd-icon` | The file icon |
| `.cd-label` | The `label`, such as "Suggested change" |
| `.cd-file` | The file's path |
| `.cd-counts` | The counts, `.cd-added` and `.cd-removed` |
| `.cd-scroll` | The box the code scrolls in when a line is too long |
| `table.cd-code` | The lines, with the first block's Shiki class when it has one |
| `tr.cd-del`, `tr.cd-add`, `tr.cd-same` | A removed, added, or unchanged line, with `data-highlight` when its block highlights it |
| `.cd-num` | A line number, in `data-line`; two per line, before and after, and only with `line` |
| `.cd-line` | The code of a line, with its `+` or `−` in `::before` |
| `.cd-code del`, `.cd-code ins` | The words that changed within a pair of lines |

## Example

GitHub's colors, the page's code font, and no deeper shade on the changed words:

```css
.cd {
  --cd-red: #cf222e;
  --cd-green: #1a7f37;
  --cd-font: "JetBrains Mono", monospace;
}

.cd-code :is(del, ins) {
  background: none;
}
```

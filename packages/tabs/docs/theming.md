---
title: Theming
description: The shared tokens, the tab strip's own variables, and the classes a page can target.
---

The tab strip is a segmented control in the style of shadcn/ui, and follows the shared tokens in [Theming](/guide/theming/). Five variables of its own change the strip, the open tab, and the space under them. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The open tab |
| `--comark-foreground` | The open tab's label, and hovered labels |
| `--comark-muted` | The other labels, and the captions without the script |
| `--comark-border` | The strip's frame |
| `--comark-accent` | The strip's tint |
| `--comark-ring` | Focus rings on tabs and panels |
| `--comark-radius` | The strip's, tabs', and panels' corners |
| `--comark-font` | The labels |

## Variables

Set these on `.ct` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ct-surface` | `--comark-accent` at 50% | Behind the strip, and a code group's captions without the script |
| `--ct-active` | `--comark-background`, a little lighter when it is dark | The open tab |
| `--ct-active-text` | `--comark-foreground` | The open tab's label |
| `--ct-gap` | `0.75rem` | The space between the strip and the open panel, except in a code group, whose block hangs from its strip |
| `--ct-font-size` | `0.8125rem` | The labels and captions |

Icons in tabs come from comark-icon: size them with `--comark-icon-size`, as [its syntax](/icon/syntax/#styling) describes.

## Classes and attributes

| Selector | Is |
| --- | --- |
| `.ct` | The block, with `data-tabs-code` when it's a code group and `data-tabs-sync` when it has a `sync` key |
| `.ct-list` | The strip |
| `.ct-tab` | Each tab, with `aria-selected="true"` on the open one |
| `.ct-panel` | Each panel, with `data-inactive` while it's closed |
| `.ct-caption` | The label over each panel, shown only without the script |
| `[data-tabs-ready]` | On `<html>` once the script runs |

One rule sits outside the `comark` layer: pages style code blocks with plain rules, so the rule that drops a code group's block margin and top corners, to join it to its strip, has to beat them.

## Example

An open tab in the page's brand color:

```css
:root {
  --ct-active: oklch(0.55 0.2 260);
  --ct-active-text: white;
}
```

To try it, paste it into Extra CSS in the [playground's Theme pane](/play/#preset=tabs-tabs).

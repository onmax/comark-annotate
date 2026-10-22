---
title: Theming
description: The shared tokens, the backdrop's variables, and the classes and attributes of the zoomed view.
---

The zoomed view follows the shared tokens in [Theming](/guide/theming/), and two variables of its own change the backdrop. The rules sit in a `comark` CSS layer, so a plain rule of your own wins over any of them.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The backdrop |
| `--comark-foreground` | The header's text, the current thumbnail's border |
| `--comark-muted` | The counter |
| `--comark-border` | The thumbnails' borders |
| `--comark-accent` | Hovered close and arrow buttons |
| `--comark-ring` | Focus rings on items and buttons |
| `--comark-radius` | Button and thumbnail corners |
| `--comark-font` | The header |

The tokens resolve on `.cz-dialog`, so tokens set there theme the zoomed view alone.

## Variables

The zoomed view sits at the end of `body`, so set these on `:root`, `body`, or `.cz-dialog`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cz-backdrop` | `--comark-background` at `--cz-backdrop-opacity` | The backdrop's color |
| `--cz-backdrop-opacity` | `96%` | How much of `--comark-background` the backdrop mixes in |

## Classes and attributes

| Selector | Is |
| --- | --- |
| `[data-zoom]` | An item on the page that zooms |
| `.cz-dialog` | The zoomed view, with `data-aside` when it shows a caption beside the item |
| `.cz-backdrop` | The layer behind everything else |
| `.cz-header`, `.cz-title`, `.cz-count`, `.cz-close` | The top row: title, position in a group, and the close button |
| `.cz-stage`, `.cz-item` | The area the item zooms into, and the zoomed copy |
| `.cz-prev`, `.cz-next` | The arrows of a group, both `.cz-nav` |
| `.cz-aside` | The caption beside the item, from `data-zoom-aside` |
| `.cz-strip`, `.cz-thumb` | The row of thumbnails, and each one, with `aria-current="true"` on the open one |

## Styles from ancestors

The zoomed copy leaves the page, so it loses rules that match through its ancestors, such as `.post img`. An item that needs them names those ancestors with `data-zoom-context`, a selector, and the copy goes inside empty copies of every ancestor that matches:

```html
<article class="post">
  <img data-zoom data-zoom-context=".post" src="pigeons.png" alt="Pigeons on the roof by week">
</article>
```

## Example

A dark backdrop that lets the page show through:

```css
:root {
  --cz-backdrop: rgb(0 0 0 / 0.8);
}

.cz-dialog {
  --comark-foreground: #fafafa;
  --comark-muted: #a1a1a1;
}
```

To try it, paste it into Extra CSS in the [playground's Theme pane](/play/#preset=zoom-image).

---
title: Theming
description: One set of --comark-* tokens themes every plugin, on top of shadcn/ui's variables.
tagline: The plugins follow shadcn/ui. On a site that uses its variables they match with no setup; elsewhere, eight tokens theme them all at once.
---

## shadcn/ui

The styles follow [shadcn/ui](https://ui.shadcn.com). On a site that already uses its CSS variables, every plugin matches it with no setup, and a `.dark` class anywhere above a block switches the theme. Elsewhere they use shadcn's neutral theme and follow the system's light or dark mode.

shadcn/ui before Tailwind 4 stores colors as bare HSL numbers, so map those through the tokens below: `--comark-border: hsl(var(--border))`.

## Tokens

Set the `--comark-*` tokens to theme annotate, carousel, embed, github-callouts, tabs, and zoom at once. Each one wins over its shadcn variable, and works on `:root` or on any ancestor:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-background` | `--background` | Button faces, the zoom backdrop, the ring around stamps, cards |
| `--comark-foreground` | `--foreground` | Text, icons, the current thumbnail, slide panels |
| `--comark-muted` | `--muted-foreground` | Counters, hosts under players, diff line numbers |
| `--comark-border` | `--border` | Button, thumbnail, screenshot, player, callout, and diff borders |
| `--comark-accent` | `--accent` | Hovered buttons, the diff header |
| `--comark-ring` | `--ring` | Focus rings, the edge of a highlighted diff line |
| `--comark-radius` | `--radius` | Corners, a little smaller on buttons and images |
| `--comark-font` | `--font-sans` | The zoomed view's header, callouts, and the links under players |

```css
:root {
  --comark-accent: oklch(0.95 0.03 250);
  --comark-radius: 0.25rem;
}
```

To theme one part only, set the tokens on its root instead: `.ca` for annotate, `.cc` for a carousel, `.ce` and `.ce-card` for embeds, `.cgc` for callouts, `.ct` for tabs, and `.cz-dialog` for the zoomed view.

## Your own rules

The rules sit in a `comark` CSS layer, so any plain rule of your own wins without `!important`, such as `.cc-step { border-radius: 0 }`.

## Nuxt UI

[Nuxt UI](https://ui.nuxt.com) names its variables differently. Map them once:

```css
:root {
  --comark-background: var(--ui-bg);
  --comark-foreground: var(--ui-text-highlighted);
  --comark-muted: var(--ui-text-muted);
  --comark-border: var(--ui-border);
  --comark-accent: var(--ui-bg-elevated);
  --comark-ring: var(--ui-primary);
  --comark-radius: calc(var(--ui-radius) * 2);
}
```

## Each plugin's own

Some things belong to one plugin, so they have their own variables:

| Plugin | Variables |
| --- | --- |
| [annotate](/annotate/#guides-theming) | `--ca-color`, `--ca-solid`, and `--ca-ink` for the default marks, stamps, and stamp numbers; `--ca-red`, `--ca-amber`, `--ca-green`, `--ca-blue`, and `--ca-gray` for the named colors; `--ca-note-font` and `--ca-code-font` |
| [carousel](/carousel/#guides-theming) | `--cc-gap` between slides, `--cc-surface` behind them |
| [embed](/embed/#guides-theming) | `--ce-app-height` for CodePen, StackBlitz, and Figma |
| [github-callouts](/github-callouts/#guides-theming) | `--cgc-note`, `--cgc-tip`, `--cgc-important`, `--cgc-warning`, and `--cgc-caution` |
| [zoom](/zoom/#guides-theming) | `data-zoom-context`, for items that need styles from their ancestors |

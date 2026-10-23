---
title: Theming
description: The color of each callout type, and the classes a callout carries.
---

Callouts follow shadcn/ui's Alert, a bordered card with the icon and title in the type's color. References and the HTML GitHub allows render as plain elements, so your page's styles apply to them. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Callouts read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The card |
| `--comark-muted` | The body |
| `--comark-border` | The card's border |
| `--comark-radius` | The card's corners |
| `--comark-font` | All text |

## Variables

Set them on `.cgc`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cgc-note` | `#2563eb`, `#60a5fa` in dark mode | `NOTE` |
| `--cgc-tip` | `#16a34a`, `#4ade80` in dark mode | `TIP` |
| `--cgc-important` | `#7c3aed`, `#a78bfa` in dark mode | `IMPORTANT` |
| `--cgc-warning` | `#d97706`, `#fbbf24` in dark mode | `WARNING` |
| `--cgc-caution` | shadcn/ui's `--destructive`, else `#dc2626`, `#f87171` in dark mode | `CAUTION` |

Each color goes to the type's icon and title.

## Classes

A callout is a `.cgc` with `data-type`: `note`, `tip`, `important`, `warning`, or `caution`. It holds `.cgc-icon`, `.cgc-title`, and `.cgc-body`.

```css
.cgc {
  --cgc-note: oklch(0.55 0.2 260);
}
```

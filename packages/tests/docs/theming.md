---
title: Theming
description: The colors of passed, failed, and skipped, the tokens the results read, and their classes.
---

Results sit in a bordered card. Each count is a badge tinted in its color, green for passed, red for failed, and muted for skipped, and each failure is a disclosure with its stack. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

The results read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-muted` | The duration, and the badge of skipped tests |
| `--comark-background` | The card |
| `--comark-foreground` | The title, mixed into each badge's text |
| `--comark-border` | The card's edge, and the line between failures |
| `--comark-accent` | A hovered failure |
| `--comark-ring` | Focus rings |
| `--comark-radius` | The card's and the badges' corners |
| `--comark-font` | The card's text |

## Variables

Set them on `.ctr`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ctr-pass` | `#259f56`, `#59d38c` in dark mode | The badge of passed tests |
| `--ctr-fail` | shadcn/ui's `--destructive`, else `#ee3533`, `#fd736d` in dark mode | The badge of failed tests, and failure messages |
| `--ctr-skip` | `--comark-muted` | The badge of skipped tests |

## Classes

The block is `section.ctr`, with `data-status` set to `passed` or `failed`. The parts are `.ctr-summary`, `.ctr-title`, `.ctr-count` with `data-kind`, `.ctr-time`, and each `details.ctr-failure` with `.ctr-message` and `pre.ctr-stack`.

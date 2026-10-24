---
title: Theming
description: The colors of passed, failed, and skipped, the tokens the results read, and their classes.
---

Results sit in a bordered card with a colored edge: green when every test passed, red when one failed. Each count has a dot in its color, and each failure is a disclosure with its stack. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

The results read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-muted` | The duration, and the dot of skipped tests |
| `--comark-border` | The card, and the line between failures |
| `--comark-accent` | A hovered failure |
| `--comark-ring` | Focus rings |
| `--comark-radius` | The card's corners |
| `--comark-font` | The card's text |

## Variables

Set them on `.ctr`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--ctr-pass` | `#259f56`, `#59d38c` in dark mode | The edge of a passing run, and the dot of passed tests |
| `--ctr-fail` | shadcn/ui's `--destructive`, else `#ee3533`, `#fd736d` in dark mode | The edge of a failing run, failed tests' dot, and failure messages |
| `--ctr-skip` | `--comark-muted` | The dot of skipped tests |

## Classes

The block is `section.ctr`, with `data-status` set to `passed` or `failed`. The parts are `.ctr-summary`, `.ctr-title`, `.ctr-count` with `data-kind`, `.ctr-time`, and each `details.ctr-failure` with `.ctr-message` and `pre.ctr-stack`.

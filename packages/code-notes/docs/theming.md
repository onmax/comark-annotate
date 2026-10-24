---
title: Theming
description: The marker's color, the tokens it reads, and the classes of markers and notes.
---

Markers are round badges in a soft tint of shadcn/ui's `--primary` when the page has it, or of the foreground color otherwise, with the number in that color. Each note starts with its marker. The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the few that keep a page's `a`, `ol`, and paragraph rules from breaking the markers and the notes' alignment.

## Shared tokens

Markers and notes read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-foreground` | Markers, when the page has no `--primary` |
| `--comark-background` | Mixed into a marker's tint |
| `--comark-accent` | The note a link jumped to |
| `--comark-ring` | Focus rings, and the marker a link jumped to |
| `--comark-radius` | The highlighted note's corners |
| `--comark-font` | A marker's number |

## Variables

Set them on `.cn-marker`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cn-marker` | shadcn/ui's `--primary`, else `--comark-foreground` | A marker's color: its tint and its edge |
| `--cn-marker-text` | `--cn-marker` | A marker's number |

## Classes

A marker is `.cn-marker`, with its number in `data-note`, drawn by CSS so copying the code leaves it out. The notes are `ol.cn-notes`; each `li` holds its marker and a `div` with the note. The note a link jumps to is highlighted with `:target`.

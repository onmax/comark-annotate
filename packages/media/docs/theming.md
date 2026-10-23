---
title: Theming
description: The tokens and classes of videos and audio players.
---

A video sits in a bordered frame at most the page's width, and an audio player takes the page's width. The players' controls are the browser's own. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Players read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-border` | A video's frame |
| `--comark-accent` | The space a video takes before its first frame loads |
| `--comark-radius` | A video's corners |

## Classes

Both players are `.cm`: `video.cm` and `audio.cm`. The fallback link inside one shows only in a browser that can't play the file.

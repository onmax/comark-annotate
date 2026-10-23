---
title: Theming
description: The tokens and classes of videos and audio players.
---

A video sits in a bordered frame at most the page's width, with the browser's own controls. An audio player takes the page's width: a bordered bar with a play button, the time, a seek bar, and a mute button. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Players read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The audio bar and the seek bar's handle |
| `--comark-foreground` | The play button and the played part of the seek bar, without a `--primary` |
| `--comark-muted` | The times and the mute button |
| `--comark-border` | A video's frame and the audio bar |
| `--comark-accent` | The space a video takes before its first frame loads, the rest of the seek bar, and the hovered mute button |
| `--comark-ring` | Focus rings |
| `--comark-radius` | A video's and the audio bar's corners |
| `--comark-font` | The times |

The play button and the played part of the seek bar use your `--primary`, or Nuxt UI's `--ui-primary`, when the page sets one, with `--primary-foreground` for the play icon.

## Classes

A video is `video.cm`. Audio is `.cm.cm-audio`, which holds the browser's `<audio>` and `.cm-bar`, its controls: `.cm-play`, two `.cm-time`, `.cm-seek`, and `.cm-mute`. The player has `data-playing` while it plays and `data-muted` while it's muted, and `data-error` when the file can't play, which shows the browser's player instead. With `audio: "native"`, audio is a plain `audio.cm`. The fallback link inside a player shows only in a browser that can't play the file.

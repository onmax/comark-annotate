---
title: Theming
description: The tokens and classes of videos and audio players.
---

A video sits in a bordered frame at most the page's width, with a bar of controls floating over its bottom edge: a play button, the time, a seek bar, a mute button, and a full screen button. The bar fades out while the video plays, unless the pointer or the focus is on the video. An audio player takes the page's width and is the same bar on its own, without full screen. A player narrower than 18rem drops the times. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

Players read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The bar, a little see-through over a video, and the seek bar's handle |
| `--comark-foreground` | The play button and the played part of the seek bar, without a `--primary` |
| `--comark-muted` | The times and the mute and full screen buttons |
| `--comark-border` | A video's frame and the audio bar |
| `--comark-accent` | The space a video takes before its first frame loads, the rest of the seek bar, and hovered buttons |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners |
| `--comark-font` | The times |

The play button and the played part of the seek bar use your `--primary`, or Nuxt UI's `--ui-primary`, when the page sets one, with `--primary-foreground` for the play icon.

## Classes

A video is `.cm.cm-video` around the browser's `<video>`, and audio is `.cm.cm-audio` around its `<audio>`. Each holds `.cm-bar`, its controls: `.cm-play`, two `.cm-time`, `.cm-seek`, `.cm-mute`, and on a video `.cm-full`. A player has `data-playing` while it plays, `data-muted` while it's muted, `data-fullscreen` while a video fills the screen, and `data-error` when the file can't play, which shows the browser's controls instead. With `controls: "native"`, a player is a plain `video.cm` or `audio.cm`. The fallback link inside a player shows only in a browser that can't play the file.

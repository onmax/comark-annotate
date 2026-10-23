---
title: Guides
description: Recording evidence for a pull request, plugin order, and private GitHub attachments.
---

## Recordings as evidence

A recording of a change at work shows a reviewer what a screenshot can't: a transition, a loading state, a sound. Keep it short and small:

- Record only the part of the screen that changes, for a few seconds.
- Encode it as H.264 `.mp4` for every browser, or `.webm` for a smaller file. `.mov` files from macOS play in Safari and Chrome but not always in Firefox.
- Describe what happens in the alt text, so a reader who can't play it still learns what it shows.
- Add `loop muted` to a clip that shows one motion, so it reads like an animated screenshot once played.

The player loads only the file's first frame and length until the reader presses play, so a page with several recordings stays light.

## Plugin order

The plugin works on Markdown's tokens, before any plugin turns them into a tree, so its place in `plugins` doesn't matter. [comark-zoom](/zoom/) never sees a video as an image to zoom, and [comark-chips](/chips/) never turns a GitHub attachment link into a chip.

## Private attachments

A GitHub attachment from a private repository only plays for a reader signed in to GitHub with access to it. For a page that readers outside the repository see, download the file and serve it with the page instead.

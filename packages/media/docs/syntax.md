---
title: Syntax
description: Which images play, the props they take, and GitHub attachment links.
---

## Files

An image plays when its address ends in one of these extensions, before any `?` or `#`:

| Extension | Becomes |
| --- | --- |
| `.mp4`, `.webm`, `.mov`, `.m4v` | `<video controls playsinline preload="metadata">` |
| `.mp3`, `.wav`, `.ogg`, `.m4a` | `<audio controls preload="metadata">` |

```md
![Signing in with a passkey](./recordings/login.mp4)
```

The alt text is the player's label for screen readers, and the text of a link to the file for a browser that can't play it. Every other image stays an image.

## Props

```md
![The spinner while the build runs](./spinner.mp4){autoplay loop muted poster="./spinner.png"}
```

| Prop | What it does |
| --- | --- |
| `autoplay` | Starts playing when the page loads. Browsers only allow it with `muted`. |
| `loop` | Starts again at the end. |
| `muted` | Starts without sound. |
| `poster` | An image to show before a video plays. |

Write `{loop=false}` to turn a prop off. Other props, such as `width` or a class, are dropped.

## GitHub attachments

A video dropped into a GitHub comment becomes a bare link, such as `https://github.com/user-attachments/assets/2f3c0e3e-…`, alone in its paragraph. GitHub plays it, and so does the plugin. A link with text of its own, or one inside a sentence, stays a link.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A video or audio file without alt text.
- `autoplay` without `muted`.
- A `poster` on audio.
- A prop it doesn't know.

Each issue names the file and says how to fix it:

```txt
`![](demo.mp4)` has no label. Describe the video in the brackets, like `![Signing in with a passkey](demo.mp4)`.
`![Demo](demo.mp4)`: browsers only start a video by itself when it's muted. Add `muted`, or remove `autoplay`.
```

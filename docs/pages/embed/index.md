---
title: comark-embed
description: Videos, audio, and live code from a link, written in Markdown.
tagline: Paste a YouTube, Vimeo, Loom, Spotify, CodePen, StackBlitz, or Figma link and get its player, with the link under it. Nothing is fetched.
install: pnpm add comark @comark/html comark-embed
---

::examples
:::example{label="Video"}
```md
::embed{url="https://www.youtube.com/watch?v=KCrXgy8qtjM" title="Vite in 100 Seconds"}
::
```
:::

:::example{label="Live code"}
```md
::embed{url="https://stackblitz.com/edit/vitejs-vite?file=index.html" title="A Vite starter on StackBlitz"}
::
```
:::

:::example{label="Link card"}
```md
::embed{url="https://comark.dev" title="Comark, Markdown with components"}
::
```
:::
::

The plugin reads the player's address from the link alone, so a document renders the same offline, in tests, and at build time. The link stays under every player, so the page still makes sense in a feed reader or where iframes are blocked, and in print each player gives way to its address.

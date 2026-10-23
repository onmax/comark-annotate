---
title: comark-media
description: Videos and audio in Markdown, written as images.
tagline: Point an image at an .mp4 or an .mp3 and get a player labeled with the alt text. GitHub attachment links play too.
install: pnpm add comark @comark/html comark-media
group: Review blocks
icon: film
blurb: Videos and audio as images
credits: 'Syntax from <a href="https://docs.gitlab.com/user/markdown/#media">GitLab</a> and <a href="https://github.blog/news-insights/product-news/video-uploads-available-github/">GitHub</a>. Sample media from <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video">MDN</a>, CC0.'
---

::examples
:::example{label="Video"}
```md
The flower opens once the page loads, as it did before the change:

![A flower opening, recorded before the fix](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm){loop muted}
```
:::

:::example{label="Audio"}
```md
The alert sound the reviewer asked for:

![The new alert sound](https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3)
```
:::
::

A screen recording is often the clearest evidence in a pull request. The plugin plays it where it sits and loads only the first frame until the reader presses play. Its controls match the page, with the browser's own as their fallback. Nothing about the syntax is new: GitLab already plays an image that points at a video, and GitHub plays an uploaded video's link.

---
title: Guides
description: Show the reading time in a layout, and choose a speed.
---

## Show it in a layout

The plugin only counts, so the layout decides where the time goes. With `@comark/html`, parse once, read the meta, and render the same document:

```ts
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import readingTime from "comark-reading-time";

const document = await parseMarkdown(markdown, { plugins: [readingTime()] });
const body = await renderHtmlFromDocument(document);
const html = `<p class="byline">${document.meta.readingTime.minutes} min read</p>${body}`;
```

With `@comark/vue` or `@comark/react`, read `meta.readingTime` from the parsed document you pass to `MarkdownDocument`.

## Choose a speed

200 words a minute is a cautious pace for technical prose. For light reading, 230 to 250 is closer to how adults read; for review documents dense with code and names, keep the default or go lower. A page of CJK text counts characters, which most readers get through faster than 200 a minute, so a site mostly in Chinese or Japanese may want a higher `wordsPerMinute`.

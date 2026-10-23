---
title: comark-reading-time
description: How long a document takes to read, counted while parsing.
tagline: Get a document's word count and reading time in its meta, with code blocks left out and Chinese, Japanese, and Korean counted by character.
install: pnpm add comark comark-reading-time
group: Authoring tools
icon: clock
blurb: Word count and reading time
---

```ts
import { parseMarkdown } from "comark";
import readingTime from "comark-reading-time";

const { meta } = await parseMarkdown(markdown, { plugins: [readingTime()] });
meta.readingTime; // { words: 1240, minutes: 7 }
```

The plugin draws nothing: it writes the numbers to `meta`, and your layout shows them where it wants, such as under the title or in a list of posts.

It counts the text a reader reads. Code blocks are left out, since a reader skims them; inline code counts. Frontmatter and comments are left out too. Chinese, Japanese, and Korean are written without spaces between words, so each of their characters counts as a word.

---
title: Getting started
description: Install comark-reading-time, register it, and read the result.
install: pnpm add comark comark-reading-time
---

## Usage

Register the plugin and read `meta.readingTime` from the parsed document:

```ts
import { parseMarkdown } from "comark";
import readingTime from "comark-reading-time";

const { meta } = await parseMarkdown(markdown, { plugins: [readingTime()] });
const label = `${meta.readingTime.minutes} min read`;
```

It works with any renderer, since it changes nothing a renderer draws. With `createHtmlRenderer`, parse first with `parseMarkdown`, read the meta, and render the document with `renderHtmlFromDocument`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `wordsPerMinute` | `200` | How many words a reader reads a minute. |

## What it writes

| Field | What it is |
| --- | --- |
| `meta.readingTime.words` | The words in the text outside code blocks, frontmatter, and comments. Each CJK character counts as one. |
| `meta.readingTime.minutes` | `words` over `wordsPerMinute`, rounded up, so any text takes at least a minute. 0 for a document with no words. |

`countWords(text)` is exported too, to count a string the same way, such as an excerpt.

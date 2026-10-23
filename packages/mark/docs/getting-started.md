---
title: Getting started
description: Install comark-mark and register it.
install: pnpm add comark comark-mark
---

## Usage

Register the plugin. It has no components and no styles, because `<mark>` and `<sup>` are native HTML:

```ts
import { parseMarkdown } from "comark";
import mark from "comark-mark";

const document = await parseMarkdown(markdown, {
  plugins: [mark()],
});
```

It works with `registerDefaultPlugins: false` and in streaming parses. Every renderer draws the nodes as they are: `mark` and `sup`.

---
title: Getting started
description: Install comark-figure and register it.
install: pnpm add comark comark-figure
---

## Usage

Register the plugin. It has no components and no styles, because a figure is native HTML:

```ts
import { parseMarkdown } from "comark";
import figure from "comark-figure";

const document = await parseMarkdown(markdown, {
  plugins: [figure()],
});
```

It works with `registerDefaultPlugins: false` and in streaming parses. With [comark-zoom](/zoom/), the image inside a figure zooms as any other image does, in either plugin order.

## Options

`figure({ unwrap: true })` also lifts every image that stands alone in its paragraph out of the `<p>`, with a title or without. Comark's `autoUnwrap` only does that in list items and blockquotes.

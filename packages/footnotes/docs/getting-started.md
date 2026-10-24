---
title: Getting started
description: Install comark-footnotes and register it in place of Comark's footnotes plugin.
install: pnpm add comark comark-footnotes
---

## Usage

Register the plugin instead of `comark/plugins/footnotes`. It has no components, because the notes render as plain HTML:

```ts
import { parseMarkdown } from "comark";
import footnotes from "comark-footnotes";

const document = await parseMarkdown(markdown, {
  plugins: [footnotes()],
});
```

It is named `footnotes`, like Comark's plugin, so a list holds one or the other. When a list holds both, Comark keeps the first, so remove the import from `comark/plugins/footnotes` rather than adding this one after it.

It works with `registerDefaultPlugins: false` and in streaming parses.

## Options

The options are Comark's, with the same defaults:

| Option | |
| --- | --- |
| `label` | The section's heading. Default `"Footnotes"`; `""` leaves the heading out. |
| `hr` | Whether a horizontal rule comes before the section. Default `true`. |
| `backRef` | The link from a note back to where it's referenced. Default `"↩"`. |

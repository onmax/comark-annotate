---
title: Getting started
description: Install comark-keys and register it.
install: pnpm add comark comark-keys
---

## Usage

Register the plugin. It has no components, because keys render as native `<kbd>`:

```ts
import { parseMarkdown } from "comark";
import keys from "comark-keys";

const document = await parseMarkdown(markdown, {
  plugins: [keys()],
});
```

It works with `registerDefaultPlugins: false` and in streaming parses: a shortcut stays text until its closing `++` arrives.

## Options

| Option | |
| --- | --- |
| `separator` | What sits between two keys. Default `"+"`; `""` puts nothing between them. |
| `keys` | More keys, or new names for built-in ones, by lowercase name: `{ hyper: "Hyper", control: "Control" }`. |

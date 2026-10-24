---
title: Getting started
description: Install comark-critic and register it.
install: pnpm add comark comark-critic
---

## Usage

Register the plugin. It has no components: insertions, deletions, and highlights are native tags that every renderer outputs as they are.

```ts
import { parseMarkdown } from "comark";
import critic from "comark-critic";

const document = await parseMarkdown(markdown, {
  plugins: [critic()],
});
```

It works with `registerDefaultPlugins: false` and in streaming parses.

## Styles

The package's styles tint insertions green, strike deletions in red, highlight in amber, and draw comments as chips. Without them, the browser underlines `<ins>`, strikes `<del>`, and paints `<mark>` yellow, and comments are plain text. Import them with yours:

```ts
import "comark-critic/style.css";
```

Or inline the same styles from `css`:

```ts
import { css } from "comark-critic";
```

## Options

`critic({ mode: "accept" })` renders the document with every change made, and `mode: "reject"` with none of them. The default, `"view"`, shows them. [Syntax](/critic/syntax/#modes) has what each mode does to each mark.

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

Browsers already underline `<ins>`, strike `<del>`, and highlight `<mark>`. Comments need the package's styles. Import them with yours:

```ts
import "comark-critic/style.css";
```

Or inline the same styles from `css`:

```ts
import { css } from "comark-critic";
```

## Options

`critic({ mode: "accept" })` renders the document with every change made, and `mode: "reject"` with none of them. The default, `"view"`, shows them. [Syntax](/critic/syntax/#modes) has what each mode does to each mark.

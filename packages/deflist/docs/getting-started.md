---
title: Getting started
description: Install comark-deflist and register it.
install: pnpm add comark comark-deflist
---

## Usage

Register the plugin. It has no components and no styles, because a definition list is native HTML:

```ts
import { parseMarkdown } from "comark";
import deflist from "comark-deflist";

const document = await parseMarkdown(markdown, {
  plugins: [deflist()],
});
```

It works with `registerDefaultPlugins: false`, in streaming parses, and inside any `::component`. Every renderer draws the nodes as they are: `dl`, `dt`, and `dd`.

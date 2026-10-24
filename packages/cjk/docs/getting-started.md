---
title: Getting started
description: Install comark-cjk and register it.
install: pnpm add comark comark-cjk
---

## Usage

Register the plugin. It has no components and no styles, because it only changes where `*`, `_`, and `~~` start and end:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { parseMarkdown } from "comark";
import cjk from "comark-cjk";

const document = await parseMarkdown(markdown, {
  plugins: [cjk()],
});
```
::

It takes no options, and works with `registerDefaultPlugins: false` and in streaming parses.

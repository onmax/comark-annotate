---
title: Getting started
description: Install comark-include and register it.
install: pnpm add comark comark-include
---

## Usage

Register the plugin. It has no components, because the included text renders as the rest of the page does:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax({ include: { root: "content", base: "guide" } }));
```

```ts
import { parseMarkdown } from "comark";
import include from "comark-include";

const document = await parseMarkdown(markdown, {
  plugins: [include({ root: "content", base: "guide" })],
});
```
::

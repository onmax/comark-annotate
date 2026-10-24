---
title: Getting started
description: Install comark-properties, register it, and choose the keys.
install: pnpm add comark @comark/html comark-properties
---

## Usage

Register the plugin and pass the renderer's `components`:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { createHtmlRenderer } from "@comark/html";
import properties, { components } from "comark-properties/html";

const render = createHtmlRenderer({ plugins: [properties()], components });
```
::

For Vue, React, or Svelte, import from `comark-properties/vue`, `comark-properties/react`, or `comark-properties/svelte`; the components add the styles when they mount. Import `comark-properties/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `keys` | `["status", "pr", "author", "date", "tags"]` | The frontmatter keys to show, in this order. A key the frontmatter doesn't have is skipped. |
| `labels` | `{}` | A label per key, such as `{ pr: "Pull request" }`. Without one a key shows capitalized, and `pr` as "PR". |
| `top` | `true` | Puts the box at the top of a document that has no `::properties`. Set it to `false` to show the box only where `::properties` sits. |

```ts
properties({ keys: ["status", "owner", "due"], labels: { due: "Due date" } });
```

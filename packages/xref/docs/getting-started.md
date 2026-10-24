---
title: Getting started
description: Install comark-xref and register it.
install: pnpm add comark comark-xref
---

## Usage

Register the plugin with any renderer:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { createHtmlRenderer } from "@comark/html";
import xref from "comark-xref";

const render = createHtmlRenderer({ plugins: [xref()] });
```
::

It needs no components: figures become `figure` and `figcaption`, tables get a `caption`, and references become links, which every renderer draws and most pages already style. [Renderers](/guide/renderers/) covers using it with other plugins.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `figure` | `"Figure"` | The word before a figure's number. |
| `table` | `"Table"` | The word before a table's number. |

```ts
xref({ figure: "Abbildung", table: "Tabelle" });
```

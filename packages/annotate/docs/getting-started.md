---
title: Getting started
description: Install comark-annotate, register it, and give your agent the skill and the CLI.
install: pnpm add comark @comark/html comark-annotate
---

## Usage

Register the plugin and pass the HTML renderers as `components`:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
const html = await render(markdown);
```

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
const html = await render(markdown);
```
::

The renderer inlines its styles and script once per document. Annotate renders only to HTML; [Renderers](/guide/renderers/) covers using it with other plugins, a strict Content Security Policy, and untrusted notes.

## Agents

The comark-ui agent skill knows the syntax, how to measure marks from the page, and how to check the result. The **For agents** button above installs it, and [Agents](/guide/agents/) covers the rest.

It also comes with a small CLI that knows zoom and carousel too.

- `check` lists every problem in one or more files, and exits with 1 if there are any.
- `render` writes a standalone page next to each file. Open it and take a screenshot to confirm each mark sits on its target.

```sh
npx comark-annotate check duck-audit.md pigeons.md
npx comark-annotate render duck-audit.md -o duck-audit.html
```

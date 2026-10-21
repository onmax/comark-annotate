---
title: comark-include
description: Markdown partials and code snippets from files, written in Markdown.
tagline: Paste a shared section, or a few lines of real source, into any page with one line, and keep a single copy of each.
install: pnpm add comark comark-include
---

::examples
:::example{label="Partial"}
```md
:include{src="./partials/install.md"}
```
:::

:::example{label="Region"}
```md
:include{src="./partials/greet.ts" region="message"}
```
:::

:::example{label="Lines"}
```md
:include{src="./partials/greet.ts" lines="1:3"}
```
:::

:::example{label="Source"}
```md
:include{src="./partials/install.md" code}
```
:::
::

These examples include real files from this site's source. A Markdown file is pasted into the page, and any other file becomes a code block in the language of its extension.

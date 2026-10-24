---
title: comark-include
description: Markdown partials and code snippets from files, written in Markdown.
keywords: partial, import, transclusion, snippet, reuse, include file, source code, code region
tagline: Paste a shared section, or a few lines of real source, into any page with one line, and keep a single copy of each.
install: pnpm add comark comark-include
group: Authoring tools
icon: file-input
blurb: Partials and snippets from files
credits: 'Arguments from <a href="https://github.com/unjs/automd">automd</a>.'
---

::examples
:::example{label="Partial"}
```md
:include{src="./partials/install.md"}
```
:::

:::example{label="Region"}
```md
:include{src="./partials/ducks.ts" region="estimate"}
```
:::

:::example{label="Lines"}
```md
:include{src="./partials/ducks.ts" lines="8:10"}
```
:::

:::example{label="As code"}
```md
:include{src="./partials/install.md" code}
```
:::
::

These examples include real files from this site's source. A Markdown file is pasted into the page, and any other file becomes a code block in the language of its extension.

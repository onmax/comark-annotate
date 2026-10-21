---
title: Comark plugins
description: Plugins for Comark that make review documents easier to read.
headline: Review documents, written in Markdown.
tagline: Annotated screenshots, code changes, charts, and more for Comark. Each plugin is its own package.
install: pnpm add comark @comark/html comark-annotate
---

::packages
::

::hero
## Write Markdown. Get a review page.

An agent writes the Markdown and the plugins draw the page. A problem comes back as one sentence that names the block and the fix.

````md
> [!TIP] Decision
> Extra filters collapse into **+2 filters**.

::screenshot{src="/after.png" alt="Filter toolbar on one row"}
:::annotation{x=67.9 y=34.8 w=13 h=14.2 mark="highlight"}
Five filters now fit on one row.
:::

:::annotation{x=82.5 y=34.8 w=10.5 h=14.2 mark="check" color="green"}
**Apply** lines up with the chips.
:::
::
````
::

::drop
## Share it on Drop

[Drop](https://drop.vitehub.dev) renders these documents as a page your team comments on, and connects to Claude Code, Codex, or any MCP agent.

1. Your agent drops the review.
2. You comment on the exact spot.
3. Your agent reads them and drops the next version.
::

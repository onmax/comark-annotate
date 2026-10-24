---
title: Getting started
description: Install comark-charts, register it, and give your agent the skill.
install: pnpm add comark @comark/html comark-charts
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
import charts, { components } from "comark-charts/html";

const render = createHtmlRenderer({ plugins: [charts()], components });
```
::

[Flint](https://github.com/microsoft/flint-chart) and [Vega](https://vega.github.io) draw each chart while parsing, on the server or at build time, so the browser runs no chart code. The package installs both. Vue, React, and Svelte have renderers too, as [Renderers](/charts/guides/#renderers) shows.

## Agents

The comark-ui agent skill knows the table shape for each chart type and how to check the result. Install it:

```sh
npx skills add onmax/comark-ui
```

Agents read charts without the skill: in the Markdown and in the page, each chart's data is a table.

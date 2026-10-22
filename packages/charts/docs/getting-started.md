---
title: Getting started
description: Install comark-charts, register it, and give your agent its skill.
install: pnpm add comark @comark/html comark-charts
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import charts, { components } from "comark-charts/html";

const render = createHtmlRenderer({ plugins: [charts()], components });
```

Charts are drawn while parsing, on the server or at build time, by [Flint](https://github.com/microsoft/flint-chart) and [Vega](https://vega.github.io), which the package installs, so the browser runs no chart code. Vue, React, and Svelte have renderers too; see [Renderers](/charts/guides/#renderers).

## Agents

The package ships an agent skill with the table shape for each chart type and how to check the result. Install it from this site:

```sh
npx skills add https://comark.onmax.me
```

Agents read charts without the skill: in the Markdown and in the page, each chart's data is a table.

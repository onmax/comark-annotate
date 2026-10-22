---
title: Comark plugins
description: Plugins for Comark that make review documents easier to read.
headline: Review documents, written in Markdown.
tagline: Annotated screenshots, code changes, charts, and more for Comark. Each plugin is its own package.
install: pnpm add comark @comark/html comark-annotate
---

::packages
:::demo{package="annotate" height=256}
```md
::screenshot{src="/after.png" alt="Filter toolbar on one row"}
::::annotation{x=68 y=33.1 w=13.3 h=16 mark="highlight"}
Moon phase and vibes live in here now.
::::

::::annotation{x=82.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
**Apply** lines up with the chips.
::::
::
```
:::

:::demo{package="charts" height=360}
```md
::chart{title="Pigeons on the roof"}
| weekday | pigeons |
| --- | --: |
| Mon | 3.2 |
| Tue | 4.1 |
| Wed | 2.8 |
| Thu | 6.5 |
| Fri | 14.7 |
::
```
:::

:::demo{package="chips" height=156}
```md
Built with [Vite](https://vite.dev), [Vue](https://vuejs.org), and [Nuxt](https://nuxt.com). Thanks @antfu for the idea.
```
:::

:::demo{package="tabs" height=188}
````md
::code-group
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```

```sh [yarn]
yarn add comark-tabs
```
::
````
:::

:::demo{package="github" height=236}
```md
> [!TIP]
> Press ⌘K to search every document.

> [!WARNING]
> Changing the slug breaks shared links.
```
:::

:::demo{package="zoom" height=240}
```md
![Office correlations dashboard](/dashboard.png)
```
:::

:::demo{package="code" height=140}
````md
```sh
pnpm add comark @comark/html comark-code
```
````
:::

:::demo{package="diff" height=216}
````md
::diff{line=2 label="Suggested change"}
```ts [src/roof.ts]
function countPigeons(roof) {
  const birds = roof.birds;
  return birds.length;
}
```
```ts
function countPigeons(roof) {
  const birds = roof.birds.filter((b) => b.pigeon);
  return birds.length;
}
```
::
````
:::

:::demo{package="icon" height=176}
```md
Built with :icon{name="logos:vue" label="Vue"} :icon{name="logos:vitejs" label="Vite"} :icon{name="logos:cloudflare-icon" label="Cloudflare"} :icon{name="logos:pnpm" label="pnpm"} :icon{name="logos:typescript-icon" label="TypeScript"}
```
:::

:::demo{package="carousel" height=224}
```md
::carousel{title="Filters"}
![Filter toolbar wrapping](/before.png)

![Filter toolbar on one row](/after.png)

![Office correlations dashboard](/dashboard.png)
::
```
:::

:::demo{package="embed" height=260}
```md
::embed{url="https://www.youtube.com/watch?v=KCrXgy8qtjM" title="Vite in 100 Seconds"}
::
```
:::

:::demo{package="lint" height=232}
```md
::screnshot{src="/before.png"}
Moon phase and vibes wrap.
```
:::

:::demo{package="include" height=248}
```md
:include{src="./partials/install.md"}
```
:::

:::demo{package="github" label="references" height=136}
```md
Thanks @onmax: this fixes #51, and onmax/comark-plugins#73 builds on it.
```
:::

:::demo{package="charts" label="line" height=372}
```md
::chart{type="line" title="Coffee cups and commits"}
| month | coffee cups | commits |
| --- | --: | --: |
| Jan | 120 | 80 |
| Feb | 135 | 96 |
| Mar | 160 | 140 |
| Apr | 150 | 152 |
| May | 190 | 210 |
::
```
:::
::

::hero
## Made for agents. Read by people.

Your agent writes the Markdown: PR evidence, reports, plans. A problem comes back as one sentence that names the block and the fix, so the agent fixes it before your team reads the page.

````md
> [!TIP] Decision
> Moon phase and vibes fold into **+2 filters**.
> Fixes #51, as @onmax asked.

::screenshot{src="/after.png" alt="Filter toolbar on one row"}
:::annotation{x=68 y=33.1 w=13.3 h=16 mark="highlight"}
Moon phase and vibes live in here now.
:::

:::annotation{x=92.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
**Apply** lines up with the chips.
:::
::

::diff{label="Suggested change"}
```css [toolbar.css]
.filters { flex-wrap: wrap; }
```
```css
.filters { flex-wrap: nowrap; }
```
::
````

````md
> [!TIP] Decision
> Moon phase and vibes fold into **+2 filters**.
> Fixes #51, as @onmax asked.

::screenshot{src="/after.png" alt="Filter toolbar on one row"}
:::annotation{x=68 y=33.1 w=13.3 h=16 mark="highlight"}
Moon phase and vibes live in here now.
:::

:::annotation{x=82.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
**Apply** lines up with the chips.
:::
::

::diff{label="Suggested change"}
```css [toolbar.css]
.filters { flex-wrap: wrap; }
```
```css
.filters { flex-wrap: nowrap; }
```
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

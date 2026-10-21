# comark-github-callouts

[![npm version](https://npmx.dev/api/registry/badge/version/comark-github-callouts)](https://npmx.dev/package/comark-github-callouts)
[![npm downloads](https://npmx.dev/api/registry/badge/downloads-month/comark-github-callouts)](https://npmx.dev/package/comark-github-callouts)
[![install size](https://npmx.dev/api/registry/badge/size/comark-github-callouts)](https://npmx.dev/package/comark-github-callouts)
[![license](https://npmx.dev/api/registry/badge/license/comark-github-callouts)](https://npmx.dev/package/comark-github-callouts)
[![docs](https://img.shields.io/badge/docs-comark.onmax.me-14b8a6?labelColor=0a0a0a)](https://comark.onmax.me/github-callouts/)

GitHub's alerts, `> [!NOTE]` through `> [!CAUTION]`, as callouts with an icon and a title. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

Comark's built-in alert plugin already reads these markers, tags the quote with its type, and leaves the drawing to you. This package draws them in every renderer, takes a title from the marker's line, and lets you change the default titles.

```sh
pnpm add comark comark-github-callouts
```

```ts
import { createHtmlRenderer } from "@comark/html";
import githubCallouts, { components } from "comark-github-callouts/html";

const render = createHtmlRenderer({ plugins: [githubCallouts()], components });
```

Write them as on GitHub. Text after the marker on its line replaces the title:

```md
> [!NOTE]
> Pigeon counts update every five minutes.

> [!WARNING] Breaking change in v2
> The `correlate` option moved.
```

The types are GitHub's five: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`. The plugin is named `alert`, so it takes the place of Comark's built-in alert plugin. A quote without a marker, or with another type, stays a quote. `githubCallouts({ titles: { note: "Nota" } })` changes the default titles.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-github-callouts/html`: the styles are inlined once per document |
| `@comark/vue` | `comark-github-callouts/vue` |
| `@comark/react` | `comark-github-callouts/react` |
| `@comark/svelte` | `comark-github-callouts/svelte` |

Each entry exports the parse plugin as `default` and the renderer's `components`. The Vue, React, and Svelte components add the styles when they mount; import `comark-github-callouts/style.css` with your styles so a server-rendered page doesn't shift.

## Customize

The styles follow shadcn/ui's Alert: they read its CSS variables, such as `--background`, `--border`, `--muted-foreground`, and `--destructive`, when the page has them, and use its neutral theme otherwise. Set the shared `--comark-*` tokens to theme callouts with zoom, carousel, and annotate, or `--cgc-note` through `--cgc-caution` to recolor one type. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

The icons are [Lucide](https://lucide.dev)'s, under its license (see `LICENSE`).

Docs and live demos: [comark.onmax.me/github-callouts](https://comark.onmax.me/github-callouts).

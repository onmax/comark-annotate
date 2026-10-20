# comark-github-callouts

GitHub's alerts, `> [!NOTE]` through `> [!CAUTION]`, as callouts with an icon and a title. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

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
> Drafts save every few seconds.

> [!WARNING] Breaking change in v2
> The `render` option moved.
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

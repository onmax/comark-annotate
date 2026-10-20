# comark-plugins

[Comark](https://comark.dev) plugins for review documents. Each package is published on its own and all of them share one version.

| Package | What it does |
| --- | --- |
| [`comark-annotate`](./packages/annotate) | Hand-drawn marks, numbered notes, and arrows on screenshots, and before/after comparisons. |
| [`comark-carousel`](./packages/carousel) | A carousel of any Markdown content, with arrows, a counter, keys, and zoom. |
| [`comark-github-callouts`](./packages/github-callouts) | GitHub's `> [!NOTE]` alerts as callouts with an icon and a title. |
| [`comark-include`](./packages/include) | Markdown partials and code snippets from files, by lines or by region. |
| [`comark-zoom`](./packages/zoom) | Zoom images and any block like medium-zoom, with Escape, Back, and click-outside to close. |

Docs and live demos: [comark.onmax.me](https://comark.onmax.me).

## Develop

```sh
pnpm install
pnpm ready      # format, lint, typecheck, build, test, and Vite Doctor
pnpm docs:build # the docs site in docs/dist
```

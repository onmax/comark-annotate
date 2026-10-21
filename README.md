# comark-plugins

[Comark](https://comark.dev) plugins for review documents. Each package is published on its own and all of them share one version.

| Package | What it does |
| --- | --- |
| [`comark-annotate`](./packages/annotate) | Hand-drawn marks, numbered notes, and arrows on screenshots, and before/after comparisons. |
| [`comark-carousel`](./packages/carousel) | A carousel of any Markdown content, with arrows, a counter, keys, and zoom. |
| [`comark-charts`](./packages/charts) | Bars, lines, areas, scatter plots, dumbbells, waterfalls, and pies from a Markdown table, drawn to SVG with the table kept under them. |
| [`comark-embed`](./packages/embed) | YouTube, Vimeo, Loom, Spotify, CodePen, StackBlitz, and Figma players from a link, with no network fetch. |
| [`comark-github-callouts`](./packages/github-callouts) | GitHub's `> [!NOTE]` alerts as callouts with an icon and a title. |
| [`comark-icon`](./packages/icon) | Iconify icons in Markdown as `:icon{name="lucide:apple"}`, drawn as CSS with no script, and the resolver other plugins draw icons with. |
| [`comark-lint`](./packages/lint) | Finds unclosed blocks, unknown components, broken anchors, and plugin issues in Comark documents, from a script, the command line, or Vite Doctor. |
| [`comark-include`](./packages/include) | Markdown partials and code snippets from files, by lines or by region. |
| [`comark-tabs`](./packages/tabs) | Tabs and code groups that switch together across the page, and read without a script. |
| [`comark-zoom`](./packages/zoom) | Zoom images and any block like medium-zoom, with Escape, Back, and click-outside to close. |

Docs and live demos: [comark.onmax.me](https://comark.onmax.me).

## Develop

```sh
pnpm install
pnpm ready      # format, lint, typecheck, build, test, and Vite Doctor
pnpm docs:build # the docs site in docs/dist
```

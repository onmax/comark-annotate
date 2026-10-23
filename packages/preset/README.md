# @onmax/comark

[![npm version](https://npmx.dev/api/registry/badge/version/@onmax/comark)](https://npmx.dev/package/@onmax/comark)
[![npm downloads](https://npmx.dev/api/registry/badge/downloads-month/@onmax/comark)](https://npmx.dev/package/@onmax/comark)
[![license](https://npmx.dev/api/registry/badge/license/@onmax/comark)](https://npmx.dev/package/@onmax/comark)
[![docs](https://img.shields.io/badge/docs-comark.onmax.me-14b8a6?labelColor=0a0a0a)](https://comark.onmax.me/preset/)

onmax's [Comark](https://comark.dev) preset: every package from [comark-plugins](https://comark.onmax.me) in one install, registered in the order they need, with one icon resolver shared by `:icon`, tabs, and code actions. It ships in lockstep with the plugins, so updating it brings their latest defaults.

```sh
pnpm add comark @comark/html @onmax/comark
```

```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

`onmax()` returns `{ plugins, components }`. Every plugin is on but `include`. Pass `false` to turn one off, which drops its components too, or an object to pass it options:

```ts
onmax({
  zoom: false,
  code: { actions: [{ id: "run", label: "Run" }] },
  github: { references: { repo: "owner/name" } },
  include: { root: "content" },
});
```

`include` is off because it reads files from disk; turn it on to paste files into a document. When you parse in a browser, pass `chips: { download: false }`, since a browser may not download another site's images.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `@onmax/comark/html` |
| `@comark/vue` | `@onmax/comark/vue` |
| `@comark/react` | `@onmax/comark/react` |
| `@comark/svelte` | `@onmax/comark/svelte` |

Vue, React, and Svelte leave out annotate and diff, which render only to HTML.

## Linting

[comark-linter](https://comark.onmax.me/lint/) finds `@onmax/comark` when it's installed and checks documents with its plugins and components.

## License

MIT

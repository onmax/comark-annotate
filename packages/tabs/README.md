# comark-tabs

Tabs and code groups, written in Markdown. Without a script every tab shows under its label, one after another; the script adds the tab strip, the arrow keys, and `sync`, which switches every block with the same key at once and remembers the choice. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

```sh
pnpm add comark comark-tabs
```

```ts
import { createHtmlRenderer } from "@comark/html";
import tabs, { components } from "comark-tabs/html";

const render = createHtmlRenderer({ plugins: [tabs()], components });
```

Each `:::tabs-item` inside `::tabs` is a tab. In a `::code-group`, each code block is one, labelled by the name in brackets after its language:

````md
::tabs{sync="os"}
:::tabs-item{label="macOS"}
Press **⌘K** to search.
:::

:::tabs-item{label="Windows"}
Press **Ctrl+K** to search.
:::
::

::code-group{sync="pm"}
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```
::
````

The markup follows the WAI-ARIA tabs pattern: ←, →, Home, and End move between tabs and open them. Blocks with the same `sync` switch together by label, the choice is saved in `localStorage` under `comark-tabs:` and the key, and the page scrolls to keep the clicked tab still when blocks above it change height. Labels and `sync` can be bound to the front matter, such as `:label="frontmatter.name"`.

The plugin adds every problem to `meta.issues`, so a host can reject a document before publishing it: a tab without a label, two tabs with the same label, content outside every tab (it doesn't render), anything but code blocks in a code group, a block with no tabs, and a `:::tabs-item` outside `::tabs` (it renders as plain content). Each issue names its block and says how to fix it.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-tabs/html`: the script is inlined once per document |
| `@comark/vue` | `comark-tabs/vue` |
| `@comark/react` | `comark-tabs/react` |
| `@comark/svelte` | `comark-tabs/svelte`, Svelte 5.20 or later |

Each entry exports the parse plugin as `default` and the renderer's `components`.

The styles follow shadcn/ui's Tabs: they read its CSS variables, such as `--background` and `--accent`, when the page has them, and use its neutral theme otherwise. Set the `--comark-*` tokens to theme every comark plugin at once; the rules sit in a `comark` CSS layer, so any plain rule of your own wins. See [Theming](https://comark.onmax.me/carousel/#guides-theming).

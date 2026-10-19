# comark-carousel

A carousel of any Markdown content, written in Markdown. Slides scroll and snap without a script; the script adds arrows, dots, and arrow keys, and zooms a slide with the others in a strip at the bottom. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

```sh
pnpm add comark comark-carousel
```

```ts
import { createHtmlRenderer } from "@comark/html";
import carousel, { components } from "comark-carousel/html";

const render = createHtmlRenderer({ plugins: [carousel()], components });
```

Every block inside `::carousel` is a slide. Use `:::slide` when a slide holds several blocks:

```md
::carousel{title="Tour"}
![Dashboard](dashboard.png)

![Settings](settings.png)

```ts
const anyContent = true
```
::

::carousel
:::slide{title="Step one"}
Text and an image in one slide.

![Step one](one.png)
:::

:::slide
Step two.
:::
::
```

`columns=2` or `columns=3` shows several slides at once on wide pages and one at a time on narrow ones. Slides zoom with [`comark-zoom`](../zoom), which comes with it, and paging in the zoomed view moves the carousel too; `zoom=false` turns that off.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-carousel/html`: the scripts are inlined once per document |
| `@comark/vue` | `comark-carousel/vue` |
| `@comark/react` | `comark-carousel/react` |
| `@comark/svelte` | `comark-carousel/svelte` |

Each entry exports the parse plugin as `default` and the renderer's `components`. 

The styles follow shadcn/ui: they read its CSS variables, such as `--background` and `--border`, when the page has them, and use its neutral theme otherwise. Set `--comark-background`, `--comark-foreground`, `--comark-muted`, `--comark-border`, `--comark-accent`, `--comark-ring`, `--comark-radius`, or `--comark-font` to theme zoom, carousel, and annotate at once; the rules sit in a `comark` CSS layer, so any plain rule of your own wins. See [Theming](https://comark.onmax.me/carousel/#guides-theming) for the Nuxt UI mapping. Override `--cc-gap` to change the space between slides.

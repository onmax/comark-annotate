# comark-annotate

Annotated screenshots and before/after comparisons for [Comark](https://comark.dev). Write Markdown, get hand-drawn marks with numbered notes as static HTML.

**[Docs and live demo](https://comark-annotate.onmax.me)**

```sh
pnpm add comark-annotate
```

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
```

```md
::compare
:::screenshot{src="before.png" alt="Filter toolbar wrapping" viewport="900x360"}
::::annotation{x=3.6 y=20.6 w=92.9 h=31.4}
Five filters don't fit, so the toolbar wraps onto a second row.
::::
:::

:::screenshot{src="after.png" alt="Filter toolbar on one row" viewport="900x360"}
::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="#16a34a"}
**Apply** lines up with the chips.
::::
:::
::
```

Coordinates are percentages of the image. Marks: `box`, `circle`, `underline`, `highlight`, `cross`, `check`. Add `side="left"` or `side="right"` to put a note beside the image with a hand-drawn arrow. The plugin lists every problem in `meta.annotateIssues`, so a host can reject a document before publishing it.

## Development

```sh
pnpm install
pnpm ready       # format, build, lint, test
pnpm docs:build  # render docs/index.md into docs/dist
```

Releases: see [RELEASING.md](./RELEASING.md).

## Credits

The marks come from [AnnotationKit](https://annotationkit.vercel.app). MIT licensed.

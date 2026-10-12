# comark-annotate

Annotated screenshots and before/after comparisons for [Comark](https://comark.dev). Write Markdown, get hand-drawn marks with numbered notes as static HTML.

**[Docs and live demo](https://comark-annotate.onmax.me)**

```sh
pnpm add comark @comark/html comark-annotate
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
::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```

Coordinates are percentages of the image. Props can be inline, in a YAML props block, or bound with `:x`. Marks: `box`, `circle`, `underline`, `highlight`, `cross`, `check`. Add `side="left"` or `side="right"` to put a note beside the image with a hand-drawn arrow. The plugin lists every problem in `meta.annotateIssues`, so a host can reject a document before publishing it.

The output is static HTML with one inlined `<style>` per document and `style` attributes for positions, so a strict CSP needs `style-src 'unsafe-inline'`. Override colors with a plain rule such as `.ca { --ca-color: #0070f3; --ca-ink: #fff }`.

## Development

```sh
pnpm install
pnpm ready       # format, lint, typecheck, build, test, doctor
pnpm docs:build  # render docs/index.md into docs/dist
```

Releases: see [RELEASING.md](./RELEASING.md).

## Credits

comark-annotate is MIT licensed. The hand-drawn marks come from [AnnotationKit](https://annotationkit.vercel.app), and [Comark](https://comark.dev) by the Comark team does the parsing and rendering.

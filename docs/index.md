---
title: comark-annotate
description: Annotated screenshots and before/after comparisons for Comark.
---

# comark-annotate

Annotated screenshots and before/after comparisons for [Comark](https://comark.dev). Write Markdown, get hand-drawn marks with numbered notes. The output is static HTML with inline styles and no script, so a saved page still looks the same years later.

::compare

:::screenshot{src="before.png" alt="Filter toolbar wrapping onto a second row" label="Before" viewport="900x360"}
::::annotation{x=3.6 y=20.6 w=92.9 h=31.4}
Five filters don't fit, so the toolbar wraps onto a second row and pushes the table down.
::::

::::annotation{x=17.3 y=38.5 w=7.4 h=9.9 mark="circle"}
**Apply** sits 6px lower than the chips.
::::

:::

:::screenshot{src="after.png" alt="Filter toolbar on one row" label="After" viewport="900x360"}
::::annotation{x=77.2 y=24.2 w=9.3 h=9.9 mark="highlight" color="#2f5bea"}
Extra filters collapse into **+2 filters**.
::::

::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="#16a34a"}
**Apply** lines up with the chips.
::::

:::
::

Hover a mark or a note to highlight its partner.

## Install

```sh
pnpm add comark-annotate
```

## Use

Register the plugin and pass the HTML renderers as `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
const html = await render(markdown);
```

The styles are inlined once per document. Everything is scoped under `.ca`, and `--ca-color` sets the default mark color.

## Write

This is the Markdown for the comparison above, shortened to one note per side:

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

### `::screenshot`

| Prop       |                                                                          |
| ---------- | ------------------------------------------------------------------------ |
| `src`      | Image URL. Required.                                                     |
| `alt`      | What the screenshot shows. Required.                                     |
| `label`    | Heading above the notes.                                                 |
| `url`      | The page that was captured, shown as a link.                             |
| `viewport` | Capture size such as `1440x900`. A compare checks that both sides match. |

Other content inside the block becomes the caption.

### `::annotation`

| Prop            |                                                                           |
| --------------- | ------------------------------------------------------------------------- |
| `x` `y` `w` `h` | The marked area as percentages of the image, from 0 to 100.               |
| `mark`          | `box` (default), `circle`, `underline`, `highlight`, `cross`, or `check`. |
| `color`         | Hex color or CSS color name. Defaults to red.                             |

The content is the note. Notes are numbered in order, and the numbers continue across both sides of a compare.

To place a mark precisely, measure the element in the page you captured and divide by the viewport:

```js
const r = element.getBoundingClientRect();
const box = {
  x: (r.x / innerWidth) * 100,
  y: (r.y / innerHeight) * 100,
  w: (r.width / innerWidth) * 100,
  h: (r.height / innerHeight) * 100,
};
```

For a full-page screenshot, add the scroll offset and divide by the page size instead.

### `::compare`

Two screenshots side by side, labelled **Before** and **After** unless they set their own `label`. On narrow screens they stack.

## Check

The plugin checks every block while parsing and lists the problems in `meta.annotateIssues`, so you can reject a document before publishing it:

```ts
import { parseMarkdown } from "comark";
import annotate from "comark-annotate";

const { meta } = await parseMarkdown(markdown, { plugins: [annotate()] });
if (meta.annotateIssues.length) throw new Error(meta.annotateIssues.join("\n"));
```

Each issue names the screenshot and annotation it belongs to, for example: `screenshot "after.png", annotation 2: the box runs past the image edge (x + w and y + h must stay within 100).` Rendering never throws. It skips what it can't draw.

## Credits

The marks come from [AnnotationKit](https://annotationkit.vercel.app). Source on [GitHub](https://github.com/onmax/comark-annotate), MIT licensed.

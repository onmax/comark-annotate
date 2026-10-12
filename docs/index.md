---
title: comark-annotate
description: Annotated screenshots for Comark.
---

Hand-drawn marks, numbered notes, arrows, and before/after comparisons. Write them in Markdown, get static HTML.

```sh
pnpm add comark-annotate
```

::tabs
:::example{label="Before / after"}
```md
::compare
:::screenshot{src="/before.png" alt="Filter toolbar wrapping onto a second row" viewport="900x360"}
::::annotation{x=3.6 y=20.6 w=92.9 h=31.4}
Five filters don't fit, so the toolbar wraps and pushes the table down.
::::

::::annotation{x=17.3 y=38.5 w=7.4 h=9.9 mark="circle"}
**Apply** sits 6px lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" viewport="900x360"}
::::annotation{x=77.2 y=24.2 w=9.3 h=9.9 mark="highlight" color="#2f5bea"}
Extra filters collapse into **+2 filters**.
::::

::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="#16a34a"}
**Apply** lines up with the chips.
::::
:::
::
```
:::

:::example{label="Side notes"}
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=36.8 y=33 w=9.5 h=3.4 mark="underline" side="left"}
Units fall below plan for the first time this quarter.
:::

:::annotation{x=66.4 y=16.9 w=30.2 h=23 side="right"}
Accuracy now counts returns.
:::

:::annotation{x=53.2 y=77.2 w=21.6 h=8.6 mark="highlight" side="left" color="#f5a524"}
Week 15 is missing for City sneaker.
:::

:::annotation{x=87.8 y=46.1 w=7.4 h=7.6 mark="circle"}
Notes without a `side` stay in the list. **Apply** waits until every filter is set.
:::
::
```
:::

:::example{label="Marks"}
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=85.4 y=5.5 w=11.3 h=7.6}
`box` frames an element.
:::

:::annotation{x=36.8 y=33 w=9.5 h=3.4 mark="circle"}
`circle` rings a small detail.
:::

:::annotation{x=3.3 y=6.3 w=18.7 h=6 mark="underline" color="#2f5bea"}
`underline` marks text.
:::

:::annotation{x=53.2 y=77.2 w=21.6 h=8.6 mark="highlight" color="#f5a524"}
`highlight` washes over an area.
:::

:::annotation{x=4.8 y=46.1 w=56.2 h=7.6 mark="cross"}
`cross` strikes something out.
:::

:::annotation{x=87.8 y=46.1 w=7.4 h=7.6 mark="check" color="#16a34a"}
`check` approves, beside its target.
:::
::
```
:::
::

Hover a mark or a note to highlight its partner. The page works without JavaScript and looks the same when you save it.

## Usage

Register the plugin and pass the HTML renderers as `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
const html = await render(markdown);
```

The styles are inlined once per document and scoped under `.ca`. Set `--ca-color` to change the default mark color.

## Components

### screenshot

An image with marks on it. Other content inside the block becomes the caption.

::example
```md
::screenshot{src="/after.png" alt="Filter toolbar on one row" label="After" url="https://pr42.preview.example.com/plan"}
:::annotation{x=77.2 y=24.2 w=9.3 h=9.9}
Extra filters collapse into **+2 filters**.
:::
::
```
::

| Prop | |
| --- | --- |
| `src` | Image URL. Required. |
| `alt` | What the screenshot shows. Required. |
| `label` | Heading above the notes. |
| `url` | The page you captured, shown as a link. |
| `viewport` | Capture size, like `1440x900`. A compare checks that both sides match. |

### annotation

A mark on the screenshot and a numbered note. The content is the note.

| Prop | |
| --- | --- |
| `x` `y` `w` `h` | The marked area, as percentages of the image from 0 to 100. |
| `mark` | `box` (default), `circle`, `underline`, `highlight`, `cross`, or `check`. |
| `side` | `left` or `right` puts the note beside the image with an arrow. |
| `color` | Hex color or CSS color name. Defaults to red. |

### compare

Two screenshots side by side, labelled **Before** and **After** unless they set their own `label`. Numbers continue from one side to the other, and the pair stacks on narrow screens.

::example
```md
::compare
:::screenshot{src="/before.png" alt="Toolbar wrapping" viewport="900x360"}
::::annotation{x=17.3 y=38.5 w=7.4 h=9.9 mark="circle"}
**Apply** sits lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Toolbar on one row" viewport="900x360"}
::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="#16a34a"}
Fixed.
::::
:::
::
```
::

## Guides

### Side notes

`side="left"` or `side="right"` moves a note out of the list and next to the image, with a hand-drawn arrow to its mark. The arrow is drawn with CSS, so there's still no script. On narrow screens the notes drop under the image and the arrows hide.

Notes on the same side need room. When two would overlap, the plugin reports it, so move one to the other side or leave it in the list.

### Placing marks

Measure the element in the page you captured and divide by the viewport. Don't estimate from the image.

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

### Validation

The plugin checks every block while parsing and lists the problems in `meta.annotateIssues`, so you can reject a document before publishing it.

```ts
import { parseMarkdown } from "comark";
import annotate from "comark-annotate";

const { meta } = await parseMarkdown(markdown, { plugins: [annotate()] });
if (meta.annotateIssues.length) throw new Error(meta.annotateIssues.join("\n"));
```

Each issue names its block and says how to fix it:

```txt
screenshot "after.png", annotation 2: the box runs past the image edge (x + w and y + h must stay within 100).
```

Rendering never throws.

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), does the hard part: the parser, the component syntax, and the HTML renderer this plugin builds on. The hand-drawn marks come from [AnnotationKit](https://annotationkit.vercel.app).

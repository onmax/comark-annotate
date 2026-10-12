---
name: comark-annotate
description: Writes annotated screenshots and before/after comparisons in Markdown with the comark-annotate Comark plugin, measures each mark from the page, and checks the rendered result. Use when the user wants PR evidence, a visual bug report, a design review, or any screenshot with marks, numbered notes, or arrows in a Markdown document.
---

# Annotated screenshots

You write Markdown; comark-annotate renders hand-drawn marks, numbered notes, side notes with arrows, and before/after pairs as static HTML. The reader only sees what you measured, so measure from the page and check the render before you hand it over.

## Choose the layout

Pick what explains the change best, and mix freely with ordinary Markdown such as tables and lists:

- One `::screenshot` with marks, when a single state shows the point.
- A `::compare` of two screenshots, when the change is the point. Capture both at the same viewport, zoom, scroll, and page state, and set the same `viewport` on both.
- A side note (`side="left"` or `side="right"`) for the one or two marks that matter most. Other notes stay numbered in the list under the image.

Keep it to about six marks per screenshot. Every note says what is wrong or what changed, not just "here".

## Syntax

```md
::compare
:::screenshot{src="before.png" alt="Filter toolbar wrapping onto a second row" viewport="1440x900" url="https://pr12.preview.example.com/plan"}
::::annotation{x=3.6 y=20.6 w=92.9 h=31.4 color="red"}
Five filters don't fit, so the toolbar wraps and pushes the table down.
::::
:::

:::screenshot{src="after.png" alt="Filter toolbar on one row" viewport="1440x900"}
::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```

- `::screenshot`: `src` and `alt` are required; `label`, `url` (the captured page), and `viewport` are optional. Other content becomes the caption.
- `::annotation`: `x y w h` are percentages of the image, 0 to 100. `mark` is `box` (default), `circle`, `underline`, `highlight`, `cross`, or `check`. `color` is `blue` (default) to point something out, `red` for a problem, `amber` for a warning, `green` for a fix, `gray` for neutral, or a hex color. `side` is `left` or `right`.
- Annotations must be direct children of a screenshot.

## Measure every mark

Never estimate coordinates from the image. In the browser you captured, measure the element and divide by the viewport:

```js
const r = document.querySelector("SELECTOR").getBoundingClientRect();
[(r.x / innerWidth) * 100, (r.y / innerHeight) * 100, (r.width / innerWidth) * 100, (r.height / innerHeight) * 100].map((v) => +v.toFixed(1));
```

For a full-page screenshot, add `scrollX`/`scrollY` and divide by `document.documentElement.scrollWidth` and `scrollHeight` instead.

## Check and preview

```sh
npx comark-annotate check report.md
npx comark-annotate render report.md -o report.html
```

`check` prints one line per problem and exits with 1 if there are any. Fix every one. `render` writes a standalone page; open it in a browser, take a screenshot, and confirm each mark sits on its target and each number matches its note. If a mark can't be verified, say so in the report instead of guessing. Relative `src` paths resolve next to the output file.

## In a Comark host

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
```

Hosts can reject a document while `meta.annotateIssues` is non-empty. For untrusted input, add Comark's `security` plugin; it also cleans notes.

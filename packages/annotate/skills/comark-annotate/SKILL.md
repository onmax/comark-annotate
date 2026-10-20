---
name: comark-annotate
description: Writes annotated screenshots, before/after comparisons, and suggested code changes in Markdown with the comark-annotate Comark plugin, measures each mark from the page, and checks the rendered result. Use when the user wants PR evidence, a visual bug report, a design review, a code suggestion, or any screenshot with marks, numbered notes, or arrows in a Markdown document.
---

# Annotated screenshots

You write Markdown; comark-annotate renders hand-drawn marks, numbered notes, side notes with arrows, and before/after pairs as static HTML. The reader only sees what you measured, so measure from the page and check the render before you hand it over.

## Choose the layout

Pick what explains the change best, and mix freely with ordinary Markdown such as tables and lists:

- One `::screenshot` with marks, when a single state shows the point.
- A `::compare` of two screenshots, when the change is the point. Capture both at the same viewport, zoom, scroll, and page state, and set the same `viewport` on both.
- `::compare{mode="slider"}` instead, when both screenshots show the same spot and the change is small, such as a number or a label at the same place. The reader drags a divider across one full-width image instead of reading two half-width ones. Side notes become numbered notes there, so skip `side`.
- A `::diff` of two code blocks, when a few lines of code are the point, such as a suggested fix. It renders like a suggested change in a GitHub review.
- A side note (`side="left"`, `"right"`, or `"top"`) for the two or three points that matter most. With `mark="none"` the arrow alone points at the spot, which reads cleanest. Other notes stay numbered in the list under the image. In a side-by-side compare only `side="top"` keeps its arrow; left and right notes join the list.

Keep it to about six marks per screenshot. Every note says what is wrong or what changed, not just "here".

## Syntax

```md
::compare
:::screenshot{src="before.png" alt="Filter toolbar wrapping onto a second row" viewport="1440x900" href="https://pr12.preview.example.com/plan"}
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

- `::compare`: `title` is optional and names the comparison for screen readers. `mode` is `columns` (default, side by side) or `slider`. Its two screenshots are titled Before and After unless they set their own.
- `::screenshot`: `src` and `alt` are required; `title` (the heading above the image), `href` (the captured page, linked by its host), and `viewport` (like `1440x900`) are optional. Other content becomes the caption.
- `::annotation`: `x y w h` are required percentages of the image, numbers from 0 to 100 without `%`. `mark` is `box` (default), `circle`, `underline`, `highlight`, `cross`, `check`, or `none`, which needs a `side`. `color` is `blue` (default) to point something out, `red` for a problem, `amber` for a warning, `green` for a fix, `gray` for neutral, or a 3- or 6-digit hex color. `side` is `left`, `right`, or `top`; keep top notes at least a quarter of the image apart and left or right notes an eighth apart.
- Annotations must be direct children of a screenshot.

````md
::diff{line=12 label="Suggested change"}
```ts [src/zoom/client.ts]
const gap = 8
history.back()
```
```ts
const gap = 8
if (opened) history.back()
```
::
````

- `::diff`: exactly two fenced blocks, before then after, in the same language, and nothing else inside; put explanations above or below it. Name the file on the first block or with `file`. `line` is the file's line number for the first line and adds line numbers; `label` is an optional heading. Keep only the lines around the change, at most 200. Leave a block empty for an added or deleted file.

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

`check` prints one line per problem and exits with 1 if there are any. Each line names the block, such as `screenshot "after.png", annotation 2` or `diff "src/a.ts"`, counting annotations within their screenshot, and says how to fix it. Fix every one. Pass several files to check them all. `render` writes a standalone page; open it in a browser, take a screenshot, and confirm each mark sits on its target and each number matches its note. If a mark can't be verified, say so in the report instead of guessing. Relative `src` paths resolve next to the output file.

## In a Comark host

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
```

Hosts can reject a document while `meta.issues` is non-empty. For untrusted input, add Comark's `security` plugin with `blockedTags` such as `script`, `style`, and `iframe`; it cleans notes too.

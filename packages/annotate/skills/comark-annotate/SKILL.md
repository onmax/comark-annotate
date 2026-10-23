---
name: comark-annotate
description: Writes annotated screenshots and before/after comparisons in Markdown with the comark-annotate Comark plugin, measures each mark from the page, and checks the rendered result. Use when the user wants PR evidence, a visual bug report, a design review, or any screenshot with marks, numbered notes, or arrows in a Markdown document.
---

# Annotated screenshots

You write Markdown; comark-annotate renders hand-drawn marks, numbered notes, side notes with arrows, and before/after pairs as static HTML. The reader only sees what you measured, so measure from the page and check the render before you hand it over.

## Choose the layout

Pick what explains the change best, and mix freely with ordinary Markdown such as tables and lists:

- One `::screenshot` with marks, when a single state shows the point.
- A `::compare` of two screenshots, when the change is the point. Capture both at the same viewport, zoom, scroll, and page state, and set the same `viewport` on both. Each image gets under half the page width, where the text of a full-page capture is too small to read, so clip both captures to the same region around the change, such as Playwright's `screenshot({ clip })`.
- `::compare{mode="slider"}` instead, when both screenshots show the same spot and the change is small, such as a number or a label at the same place. The reader drags a divider across one full-width image instead of reading two half-width ones. Side notes become numbered notes there, so skip `side`.
- A side note (`side="top"`, `"bottom"`, `"left"`, or `"right"`) for the two or three points that matter most. With `mark="none"` and `to` on the exact spot, the arrow alone points and nothing covers the screen, which reads cleanest. Other notes stay numbered in the list under the image. In a side-by-side compare only `top` and `bottom` keep their arrows; left and right notes join the list.

For a review the reader should follow without a key, write it the way a designer marks up a board: one `ink` for the whole compare, every note a side note in the margin nearest its point, set off with `at` so its arrow sweeps in, and a `bracket` where a note covers a run of rows. Write the notes of a compare as a pair that argue the change: "The type gets the headline…" on the before, "The message becomes the starting point." on the after.

Mark the change at its own size: the bar, field, or label that changed. What stayed the same goes unmarked, or in one sentence above the screenshots. Keep it to about six marks per screenshot, fewer in a compare. Each note says what changed or what is wrong in the words the screen shows, so the reader can check it against the image; a value the screenshot doesn't show stays out of the note.

## Syntax

```md
::compare
:::screenshot{src="before.png" alt="Filter toolbar wrapping onto a second row" viewport="1440x900" href="https://pr12.preview.example.com/correlations"}
::::annotation{x=3.6 y=20.6 w=92.9 h=31.4 color="red"}
Moon phase and vibes don't fit, so the toolbar wraps and pushes the table down.
::::
:::

:::screenshot{src="after.png" alt="Filter toolbar on one row" viewport="1440x900"}
::::annotation{x=87.6 y=24.2 w=7.4 h=9.9 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```

- `::compare`: `title` is optional and names the comparison for screen readers. `mode` is `columns` (default, side by side) or `slider`. `ink` colors every annotation in both screenshots that doesn't set its own `color`. Its two screenshots are titled Before and After unless they set their own.
- `::screenshot`: `src` and `alt` are required; `title` (the heading above the image), `href` (the captured page, linked by its host), `viewport` (like `1440x900`), and `ink` are optional. Other content becomes the caption.
- `::annotation`: `x y w h` are required percentages of the image, numbers from 0 to 100 without `%`. `mark` is `box` (default), `circle`, `underline`, `highlight`, `bracket`, `cross`, `check`, or `none`, which needs a `side`. `color` is `blue` (default) to point something out, `red` for a problem, `amber` for a warning, `green` for a fix, `violet` for the author's commentary, `gray` for neutral, or a 3- or 6-digit hex color. `side` is `top`, `bottom`, `left`, or `right`; keep top or bottom notes at least a quarter of the image apart and left or right notes an eighth apart.
- `at` moves a side note along its margin, as a percentage of the image (across for top and bottom, down for left and right). A note set off from its point reads away from it, so put it on the side with room: a top note at `at=40` pointing left of 40 reads to the right. `to="x,y"` is the point the arrow lands on, measured like the box; without it the arrow meets the middle of the mark's facing edge. Both need a `side`.
- Annotations must be direct children of a screenshot.

## Measure every mark

Never estimate coordinates from the image. In the browser you captured, measure the element and divide by the viewport:

```js
const r = document.querySelector("SELECTOR").getBoundingClientRect();
[(r.x / innerWidth) * 100, (r.y / innerHeight) * 100, (r.width / innerWidth) * 100, (r.height / innerHeight) * 100].map((v) => +v.toFixed(1));
```

For a full-page screenshot, add `scrollX`/`scrollY` and divide by `document.documentElement.scrollWidth` and `scrollHeight` instead.
For a clipped capture, `getBoundingClientRect()` and Playwright's main-frame `clip` use viewport-relative coordinates, so do not add `scrollX`/`scrollY` to this formula. Make sure the clip fully contains every marked element. Subtract the clip's `x` and `y` and divide by its `width` and `height`; if an element crosses the clip edge, intersect its measured rectangle with the clip before normalizing so every value stays between 0 and 100. If the clip is in document coordinates, convert it to viewport coordinates before subtracting.

## Check and preview

```sh
npx comark-annotate check report.md
npx comark-annotate render report.md -o report.html
```

`check` prints one line per problem and exits with 1 if there are any. Each line names the block, such as `screenshot "after.png", annotation 2`, counting annotations within their screenshot, and says how to fix it. Fix every one. Pass several files to check them all. `render` writes a standalone page; open it in a browser, take a screenshot, and confirm each mark sits on its target and each number matches its note. If a mark can't be verified, say so in the report instead of guessing. Relative `src` paths resolve next to the output file.

## In a Comark host

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
```

Hosts can reject a document while `meta.issues` is non-empty. For untrusted input, add Comark's `security` plugin with `blockedTags` such as `script`, `style`, and `iframe`; it cleans notes too.

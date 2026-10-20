---
title: comark-annotate
description: Hand-drawn marks, numbered notes, and arrows on screenshots, written in Markdown.
tagline: Mark up screenshots in Markdown with hand-drawn marks, numbered notes, arrows, and before/after comparisons, and show code changes as suggested changes.
install: pnpm add comark @comark/html comark-annotate
---

::tabs
:::example{label="Before / after"}
```md
::compare
:::screenshot{src="/before.png" alt="Filter toolbar wrapping onto a second row" viewport="640x250"}
::::annotation{x=5 y=29.6 w=90 h=45.3 color="red"}
Five filters don't fit, so the toolbar wraps and pushes the table down.
::::

::::annotation{x=50.9 y=55.4 w=10.5 h=14.2 mark="circle" color="red"}
**Apply** sits 6px lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" viewport="640x250"}
::::annotation{x=67.9 y=34.8 w=13 h=14.2 mark="highlight" color="blue"}
Extra filters collapse into **+2 filters**.
::::

::::annotation{x=82.5 y=34.8 w=10.5 h=14.2 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```
:::

:::example{label="Slider"}
```md
::compare{mode="slider"}
:::screenshot{src="/before.png" alt="Filter toolbar wrapping onto a second row" viewport="640x250"}
::::annotation{x=50.9 y=55.4 w=10.5 h=14.2 mark="circle" color="red"}
**Apply** sits 6px lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Filter toolbar on one row" viewport="640x250"}
::::annotation{x=82.5 y=34.8 w=10.5 h=14.2 mark="check" color="green"}
**Apply** lines up with the chips.
::::
:::
::
```
:::

:::example{label="Pointers"}
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=37.6 y=31.9 w=11.9 h=3.3 mark="none" side="top"}
Units fell below plan.
:::

:::annotation{x=66.4 y=16.4 w=29.4 h=22.2 mark="none" side="top"}
Accuracy now counts returns.
:::

:::annotation{x=53.1 y=74.7 w=21.2 h=8.4 mark="none" side="left"}
Week 15 never loaded.
:::
::
```
:::

:::example{label="Side notes"}
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=37.6 y=31.9 w=11.9 h=3.3 mark="underline" side="left" color="red"}
Units fall below plan for the first time this quarter.
:::

:::annotation{x=66.4 y=16.4 w=29.4 h=22.2 side="right"}
Accuracy now counts returns.
:::

:::annotation{x=53.1 y=74.7 w=21.2 h=8.4 mark="highlight" side="left" color="amber"}
Week 15 is missing for City sneaker.
:::

:::annotation{x=84.7 y=44.6 w=9.3 h=7.3 mark="circle"}
Notes without a `side` stay in the list. **Apply** waits until every filter is set.
:::
::
```
:::

:::example{label="Marks"}
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=81.8 y=5.3 w=14.1 h=7.3}
`box` frames an element.
:::

:::annotation{x=37.6 y=31.9 w=11.9 h=3.3 mark="circle"}
`circle` rings a small detail.
:::

:::annotation{x=4.2 y=6.1 w=23.4 h=5.8 mark="underline" color="blue"}
`underline` marks text.
:::

:::annotation{x=53.1 y=74.7 w=21.2 h=8.4 mark="highlight" color="amber"}
`highlight` washes over an area.
:::

:::annotation{x=6 y=44.6 w=45.2 h=7.3 mark="cross" color="red"}
`cross` strikes something out.
:::

:::annotation{x=84.7 y=44.6 w=9.3 h=7.3 mark="check" color="green"}
`check` approves and sits beside its target.
:::
::
```
:::
::

Hover a mark or a note to highlight the other, and click a screenshot to zoom it. To share one, use its Copy button or press Ctrl+C (⌘C on a Mac) while it's focused; you get a PNG of the screenshot with its marks and notes. The browser's own Copy Image on the screenshot copies the same PNG once the pointer has been over it. If the image comes from another origin, its server has to send CORS headers. In an iframe, the frame needs `allow="clipboard-write"`. A comparison shows its screenshots side by side, or one at a time on a narrow page, and they zoom as one gallery; a slider lays one over the other, and you drag the divider between them. The page reads the same without a script; [zoom](/zoom) and [carousel](/carousel) come with the package.

## Usage

Register the plugin and pass the HTML renderers as `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import annotate, { components } from "comark-annotate/html";

const render = createHtmlRenderer({ plugins: [annotate()], components });
const html = await render(markdown);
```

The renderer inlines its styles once per document; [Theming](#guides-theming) covers how to change them. Positions use `style` attributes, so a strict CSP needs `style-src 'unsafe-inline'`. Notes are ordinary Markdown, so raw HTML in them renders like anywhere else in the document; for untrusted input, add Comark's `security` plugin and list the tags to drop, such as `security({ blockedTags: ["script", "style", "iframe"] })`; it cleans notes too.

## Components

### screenshot

An image with marks on it. Other content inside the block becomes the caption.

::example
```md
::screenshot{src="/after.png" alt="Filter toolbar on one row" title="After" href="https://pr42.preview.example.com/plan"}
:::annotation{x=67.9 y=34.8 w=13 h=14.2}
Extra filters collapse into **+2 filters**.
:::
::
```
::

| Prop | |
| --- | --- |
| `src` | Image URL. Required. |
| `alt` | What the screenshot shows. Required. |
| `title` | Heading above the image, and the title of its zoomed view. |
| `href` | The page you captured, linked by its host next to the title. |
| `viewport` | Capture size in pixels, like `1440x900`. A compare checks that both sides match. |

### annotation

A mark on the screenshot and its note. The content is the note. Props can be inline, in a YAML props block, or bound with `:x`. Notes in the list under the image are numbered. Side notes sit beside or above the image and point with an arrow instead.

::example
```md
::screenshot{src="/dashboard.png" alt="Forecast planning dashboard"}
:::annotation{x=81.8 y=5.3 w=14.1 h=7.3 color="blue"}
**Export CSV** includes the filters you set.
:::

:::annotation{x=66.4 y=16.4 w=29.4 h=22.2 side="right" color="green"}
Accuracy now counts returns.
:::
::
```
::

| Prop | |
| --- | --- |
| `x` `y` `w` `h` | The marked area, as percentages of the image: numbers from 0 to 100, without `%`. All four are required. |
| `mark` | `box` (default), `circle`, `underline`, `highlight`, `cross`, `check`, or `none` to let a side note's arrow do the pointing. `none` needs a `side`. |
| `side` | `left`, `right`, or `top` puts the note beside or above the image with an arrow. |
| `color` | `blue` (default) points something out, `red` flags a problem, `amber` a warning, `green` a fix, `gray` anything neutral. Each has a dark-mode value. A 3- or 6-digit hex color like `#e11d48` works too, and its stamp gets whichever of a white or dark number reads better. |

### compare

Two screenshots side by side, titled **Before** and **After** unless they set their own `title`. Numbers continue from one side to the other, and the pair stacks on narrow screens. Notes with `side="left"` or `side="right"` join the numbered list under their screenshot, since beside it they'd sit against the other one and shrink their own image; notes with `side="top"` stay above.

With `mode="slider"`, the two screenshots share one frame: Before shows left of a divider and After right of it. Drag anywhere on the pair, or focus the handle and use the arrow keys, to move it; a click on the screenshots that doesn't drag zooms the pair. Use it when both screenshots show the same spot and the change is small, so the reader sees it at full width. Side notes become numbered notes in the list, since an arrow would cross the divider. Without the script, the two screenshots stack.

::example
```md
::compare{title="Toolbar alignment"}
:::screenshot{src="/before.png" alt="Toolbar wrapping" viewport="640x250"}
::::annotation{x=50.9 y=55.4 w=10.5 h=14.2 mark="circle" color="red"}
**Apply** sits lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Toolbar on one row" viewport="640x250"}
::::annotation{x=82.5 y=34.8 w=10.5 h=14.2 mark="check" color="green"}
Fixed.
::::
:::
::
```
::

| Prop | |
| --- | --- |
| `title` | What the comparison shows, read out by screen readers. Defaults to "Comparison". |
| `mode` | `columns` (default) puts the screenshots side by side; `slider` lays them over each other with a divider to drag. |

### diff

A code change, shown the way a pull request review shows a suggested change. Write the code before and after as two ordinary fenced blocks; the diff marks removed lines red and added lines green, and within a pair of changed lines, the words that changed. The header shows the file and how many lines were added and removed. Leave the first block empty for a new file, or the second for a deleted one.

::example
````md
::diff{line=212 label="Suggested change"}
```ts [packages/zoom/src/client.ts]
function close() {
  dialog.close();
  history.back();
}
```
```ts
function close() {
  dialog.close();
  if (opened) history.back();
}
```
::
````
::

| Prop | |
| --- | --- |
| `file` | The file's path. Defaults to the name on the first block, like `` ```ts [src/a.ts] ``; one of the two is required. |
| `line` | The file's line number for the first line of both blocks. Without it, the diff has no line numbers. |
| `label` | A heading before the file name, such as "Suggested change". |

Keep both blocks to the lines around the change; the plugin reports a block over 200 lines, two blocks in different languages or files, and a diff with no change. The line numbers and the `+` and `−` come from CSS, so copying a selection copies only the code. With Comark's `shiki` plugin, both blocks keep their highlighting. One diff shows one file and takes no unified diff: it's for a change a reader should see, which a few lines before and after show best.

## Guides

### Side notes

`side="left"`, `side="right"`, or `side="top"` moves a note out of the list and next to or above the image, with a hand-drawn arrow to its mark. Pair it with `mark="none"` to point without drawing a box. Side notes have no number because the arrow links them. In a compare, only notes above keep their arrow. On narrow screens they drop under the image, the arrows hide, and each note and its target get a matching letter.

Notes on the same side need room. The plugin reports side notes whose marks sit close together vertically, since they would likely overlap. It can't measure the text, so check the rendered page too, and move one note to the other side or into the list.

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

The plugin checks every block while parsing and adds the problems to `meta.issues`, so you can reject a document before publishing it. Zoom and carousel add theirs to the same list.

```ts
import { parseMarkdown } from "comark";
import annotate from "comark-annotate";

const { meta } = await parseMarkdown(markdown, { plugins: [annotate()] });
if (meta.issues.length) throw new Error(meta.issues.join("\n"));
```

Each issue names its block and says how to fix it. A screenshot goes by its `src`, or by its position and `alt` when another screenshot shares it; an annotation goes by its position in its screenshot:

```txt
screenshot "after.png", annotation 2: the box runs past the image edge. Keep x + w and y + h within 100.
```

Unknown props are reported with the valid ones, and so is a `:bound` prop that points at missing frontmatter. Bindings to `data` or `props` are left to the renderer.

Rendering never throws.

### Theming

The styles follow [shadcn/ui](https://ui.shadcn.com). On a site that already uses its CSS variables, screenshots and comparisons match it with no setup, and a `.dark` class anywhere above them switches the theme. Elsewhere they use shadcn's neutral theme and follow the system's light or dark mode.

Set the `--comark-*` tokens to theme zoom, carousel, and annotate at once. Each one wins over its shadcn variable, and works on `:root` or on any ancestor:

| Token | Falls back to | Used for |
| --- | --- | --- |
| `--comark-background` | `--background` | Button faces, the zoom backdrop, the ring around stamps |
| `--comark-foreground` | `--foreground` | Text, icons, the current thumbnail, slide panels |
| `--comark-muted` | `--muted-foreground` | The zoom and carousel counters, diff line numbers |
| `--comark-border` | `--border` | Button, thumbnail, screenshot, and diff borders |
| `--comark-accent` | `--accent` | Hovered buttons, the diff header |
| `--comark-ring` | `--ring` | Focus rings |
| `--comark-radius` | `--radius` | Corners, a little smaller on buttons and images |
| `--comark-font` | `--font-sans` | The zoomed view's header |

```css
:root {
  --comark-accent: oklch(0.95 0.03 250);
  --comark-radius: 0.25rem;
}
```

The rules sit in a `comark` CSS layer, so any plain rule of your own wins without `!important`, such as `.cc-step { border-radius: 0 }`. shadcn/ui before Tailwind 4 stores colors as bare HSL numbers, so map those: `--comark-border: hsl(var(--border))`.

[Nuxt UI](https://ui.nuxt.com) names its variables differently. Map them once:

```css
:root {
  --comark-background: var(--ui-bg);
  --comark-foreground: var(--ui-text-highlighted);
  --comark-muted: var(--ui-text-muted);
  --comark-border: var(--ui-border);
  --comark-accent: var(--ui-bg-elevated);
  --comark-ring: var(--ui-primary);
  --comark-radius: calc(var(--ui-radius) * 2);
}
```

The mark colors are separate from the theme, because each one means something: a plain `.ca { --ca-color: #0070f3; --ca-solid: #0070f3; --ca-ink: #fff }` changes the default marks, arrows, and notes (`--ca-color`), stamps (`--ca-solid`), and stamp numbers (`--ca-ink`), and `--ca-red`, `--ca-amber`, `--ca-green`, `--ca-blue`, and `--ca-gray` change the named ones. Side notes and labels use `--ca-note-font`; this page sets it to Caveat for the handwritten look. A diff's code uses `--ca-code-font`, and its colors come from `--ca-red` and `--ca-green`.

## Agents

The package ships an agent skill with the syntax, how to measure marks from the page, and how to check the result. Install it from this site:

```sh
npx skills add https://comark.onmax.me
```

It also comes with a small CLI that knows zoom and carousel too. `check` lists every problem in one or more files and exits with 1 if there are any; `render` writes a standalone page next to each file, which you can open and screenshot to confirm each mark sits on its target.

```sh
npx comark-annotate check report.md other.md
npx comark-annotate render report.md -o report.html
```

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), does the hard part: the parser, the component syntax, and the HTML renderer this plugin builds on. The hand-drawn marks come from [AnnotationKit](https://annotationkit.vercel.app).

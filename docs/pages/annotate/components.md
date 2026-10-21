---
title: Components
description: screenshot, annotation, compare, and diff, and the props each takes.
---

## screenshot

An image with marks on it. Other content inside the block becomes the caption.

::example
```md
::screenshot{src="/after.png" alt="Filter toolbar on one row" title="After" href="https://pr42.preview.example.com/correlations"}
:::annotation{x=68 y=33.1 w=13.3 h=16}
Moon phase and vibes collapse into **+2 filters**.
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

## annotation

A mark on the screenshot and its note. The content is the note. Props can be inline, in a YAML props block, or bound with `:x`. Notes in the list under the image are numbered. Side notes sit beside or above the image and point with an arrow instead.

::example
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=82.4 y=5.3 w=14.2 h=8.8 color="blue"}
**Export CSV** keeps the filters you set, moon phase included.
:::

:::annotation{x=66.1 y=17 w=30.5 h=24.6 side="right" color="green"}
r now counts the office cat.
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

## compare

Two screenshots side by side, titled **Before** and **After** unless they set their own `title`. Numbers continue from one side to the other, and the pair stacks on narrow screens. Notes with `side="left"` or `side="right"` join the numbered list under their screenshot, since beside it they'd sit against the other one and shrink their own image; notes with `side="top"` stay above.

With `mode="slider"`, the two screenshots share one frame: Before shows left of a divider and After right of it. Drag anywhere on the pair, or focus the handle and use the arrow keys, to move it; a click on the screenshots that doesn't drag zooms the pair. Use it when both screenshots show the same spot and the change is small, so the reader sees it at full width. Side notes become numbered notes in the list, since an arrow would cross the divider. Without the script, the two screenshots stack.

::example
```md
::compare{title="Toolbar alignment"}
:::screenshot{src="/before.png" alt="Toolbar wrapping" viewport="640x250"}
::::annotation{x=23.6 y=52.7 w=10.9 h=16 mark="circle" color="red"}
**Apply** sits lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Toolbar on one row" viewport="640x250"}
::::annotation{x=82.5 y=33.1 w=10.9 h=16 mark="check" color="green"}
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

## diff

A code change, shown the way a pull request review shows a suggested change. Write the code before and after as two ordinary fenced blocks; the diff marks removed lines red and added lines green, and within a pair of changed lines, the words that changed. The header shows the file and how many lines were added and removed. Leave the first block empty for a new file, or the second for a deleted one.

::example
````md
::diff{line=12 label="Suggested change"}
```ts [src/roof.ts]
function countPigeons(roof) {
  const birds = roof.birds;
  return birds.length;
}
```
```ts
function countPigeons(roof) {
  const birds = roof.birds.filter((bird) => bird.kind === "pigeon");
  return birds.length;
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

Keep both blocks to the lines around the change; the plugin reports a block over 200 lines, two blocks in different languages or files, and a diff with no change. The line numbers and the `+` and `−` come from CSS, so copying a selection copies only the code. With Comark's `shiki` plugin, both blocks keep their highlighting, and a line a block highlights, like `` ```ts {2} ``, stays highlighted. One diff shows one file and takes no unified diff: it's for a change a reader should see, which a few lines before and after show best.

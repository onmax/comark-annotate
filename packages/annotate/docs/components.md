---
title: Components
description: screenshot, annotation, and compare, one page each.
---

Three blocks, each on its own page:

- [`screenshot`](/annotate/components/screenshot/) is an image with marks on it.
- [`annotation`](/annotate/components/annotation/) is one mark and its note, inside a screenshot.
- [`compare`](/annotate/components/compare/) shows two screenshots side by side, or one over the other with a slider.

An `annotation` goes inside a `screenshot`, and a `compare` holds two screenshots:

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
| `ink` | The color of every mark and note that doesn't set its own `color`. Takes the same values as `color`. |

## annotation

A mark on the screenshot and its note. The content is the note. Props can be inline, in a YAML props block, or bound with `:x`. Notes in the list under the image are numbered. Side notes sit beside, above, or below the image and point with an arrow instead.

A side note sits level with its mark unless `at` moves it along its margin; its arrow then leaves the note level and sweeps into the mark, the way a hand-drawn leader does. `to` aims the arrow at one point instead of the middle of the mark's edge, which suits `mark="none"`: the arrow alone points, and nothing covers the screen.

::example
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=37 y=33.1 w=16.4 h=5.2 mark="none" side="top" at=58 to="44,33"}
Bugs fixed fell with the duck supply.
:::

:::annotation{x=4 y=77.3 w=92 h=8.2 mark="none" side="bottom" at=42 to="55,81"}
The pigeons ate week 15.
:::
::
```
::

::example
```md
::screenshot{src="/dashboard.png" alt="Office correlations dashboard"}
:::annotation{x=82.4 y=5.3 w=14.2 h=8.8 color="blue"}
**Export CSV** includes the filters you set.
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
| `mark` | `box` (default), `circle`, `underline`, `line`, `highlight`, `bracket`, `cross`, `check`, or `none` to let a side note's arrow do the pointing. A `line` runs straight through the middle of its box, along its longer side, such as a fold or a limit. A `bracket` stands on the edge that faces its side note, the left one without a note, to span a run of rows or a group without covering it. `none` needs a `side`. Each mark wobbles a little differently, seeded by its box, so no two match and every render draws the same. |
| `side` | `left`, `right`, `top`, or `bottom` puts the note beside, above, or below the image with an arrow. |
| `at` | Where a side note sits along its margin, as a percentage of the image: across it for `top` and `bottom`, down it for `left` and `right`. Defaults to level with the arrow's point. A note set off to one side starts where its arrow leaves it and reads away from the point. Needs a `side`. |
| `to` | The point the arrow lands on, as two percentages of the image, like `to="42,18"`. Defaults to the middle of the mark's edge that faces the note. Needs a `side`. |
| `color` | `violet` (default) points something out and reads on light and dark screenshots alike, `red` flags a problem, `amber` a warning, `green` a fix, `blue` is a second voice beside the default, `gray` anything neutral. Each has a dark-mode value. A 3- or 6-digit hex color like `#e11d48` works too, and its stamp gets whichever of a white or dark number reads better. |

## compare

Two screenshots side by side, titled **Before** and **After** unless they set their own `title`. Numbers continue from one side to the other, and the pair stacks on narrow screens. Notes with `side="left"` or `side="right"` join the numbered list under their screenshot, since beside it they'd sit against the other one and shrink their own image; notes with `side="top"` and `side="bottom"` stay above and below, and both images keep the same room for them so they stay level.

With `mode="slider"`, the two screenshots share one frame: Before shows left of a divider and After right of it. Drag anywhere on the pair, or focus the handle and use the arrow keys, to move it; a click on the screenshots that doesn't drag zooms the pair. Use it when both screenshots show the same spot and the change is small, so the reader sees it at full width. Side notes become numbered notes in the list, since an arrow would cross the divider. Without the script, the two screenshots stack.

::example
```md
::compare{title="Toolbar alignment"}
:::screenshot{src="/before.png" alt="Toolbar wrapping" viewport="640x250"}
::::annotation{x=22.4 y=50.4 w=13.3 h=20.6 mark="circle" color="red"}
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
| `ink` | The color of every mark and note in both screenshots that doesn't set its own. A screenshot's own `ink` wins. |

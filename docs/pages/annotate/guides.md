---
title: Guides
description: Side notes, placing marks, validation, and theming.
---

## Side notes

`side="left"`, `side="right"`, or `side="top"` moves a note out of the list and next to or above the image, with a hand-drawn arrow to its mark. Pair it with `mark="none"` to point without drawing a box. Side notes have no number because the arrow links them. In a compare, only notes above keep their arrow. On narrow screens they drop under the image, the arrows hide, and each note and its target get a matching letter.

Notes on the same side need room. The plugin reports side notes whose marks sit close together vertically, since they would likely overlap. It can't measure the text, so check the rendered page too, and move one note to the other side or into the list.

## Placing marks

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

## Validation

The plugin adds a problem with any block to `meta.issues`, as [Validation](/guide/validation/) describes. A screenshot goes by its `src`, or by its position and `alt` when another screenshot shares it; an annotation goes by its position in its screenshot:

```txt
screenshot "after.png", annotation 2: the box runs past the image edge. Keep x + w and y + h within 100.
```

Unknown props are reported with the valid ones, and so is a `:bound` prop that points at missing frontmatter. Bindings to `data` or `props` are left to the renderer.

## Theming

Screenshots, comparisons, and diffs follow the shared tokens in [Theming](/guide/theming/). The mark colors are separate from the theme, because each one means something: a plain `.ca { --ca-color: #0070f3; --ca-solid: #0070f3; --ca-ink: #fff }` changes the default marks, arrows, and notes (`--ca-color`), stamps (`--ca-solid`), and stamp numbers (`--ca-ink`), and `--ca-red`, `--ca-amber`, `--ca-green`, `--ca-blue`, and `--ca-gray` change the named ones. Side notes and labels use `--ca-note-font`; this page sets it to Caveat for the handwritten look. A diff's code uses `--ca-code-font`, and its colors come from `--ca-red` and `--ca-green`.

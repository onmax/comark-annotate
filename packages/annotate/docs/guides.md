---
title: Guides
description: Side notes, placing marks, and validation.
---

## Side notes

`side="left"`, `side="right"`, or `side="top"` moves a note out of the list to beside or above the image, with a hand-drawn arrow to its mark. Add `mark="none"` to point at something without drawing a box. Side notes have no number, because the arrow already links them to their mark.

- In a compare, only notes above the image keep their arrow.
- On narrow screens, side notes drop under the image and the arrows hide. Each note and its target get a matching letter instead.

Notes on the same side need room. The plugin reports side notes whose marks sit close together vertically, since they would likely overlap. It can't measure the text, so check the rendered page too. If two notes collide, move one to the other side or into the list.

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

Numbers place themselves. Each sits on a corner of its mark, so it reads as that mark's number and not its neighbor's. It tries top left, top right, bottom left, then bottom right, and takes the first corner clear of other numbers, marks, and arrows. If it would hang past the image's edge, it lines up with the mark's edge instead.

Set `viewport` on the screenshot so the plugin judges the corners against the image's real shape. If marks crowd so close that two numbers overlap at every corner, the plugin reports both annotations.

## Validation

The plugin adds a problem with any block to `meta.issues`, as [Validation](/guide/validation/) describes. Each issue names its block. A screenshot goes by its `src`, or by its position and `alt` when another screenshot has the same `src`. An annotation goes by its position in its screenshot:

```txt
screenshot "after.png", annotation 2: the box runs past the image edge. Keep x + w and y + h within 100.
```

The plugin reports an unknown prop with a list of the valid ones, and a `:bound` prop that points at missing frontmatter. It leaves bindings to `data` or `props` to the renderer. Each kind of problem has its own rule in [Doctor](/doctor/), with an example and its fix.

## Theming

Screenshots and comparisons follow the shared tokens in [Theming](/guide/theming/). The mark colors stay separate from the theme, because each one means something.

- `--ca-color`, `--ca-solid`, and `--ca-ink` on `.ca` change the default marks, arrows, and notes, their stamps, and the stamp numbers.
- `--ca-red`, `--ca-amber`, `--ca-green`, `--ca-blue`, and `--ca-gray` change the named colors.
- Side notes and labels are handwritten in Caveat, which comes inlined with the styles, about 32 KB once per page. `--ca-note-font` sets another family, and `--ca-note-font: inherit` uses the page font.
- `--ca-note-size` and `--ca-label-size` set the size of notes and labels.

The annotate [Theming](/annotate/theming/) page lists every variable and class.

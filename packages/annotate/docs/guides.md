---
title: Guides
description: Side notes, placing marks, and validation.
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

Numbers place themselves. Each one sits outside a corner of its mark, so it doesn't cover what the mark points at. It takes the first corner, in the order top left, top right, bottom left, bottom right, that keeps it off the other numbers, marks, and arrows. Against the image's edge it slides along that edge. Set `viewport` on the screenshot so the corners are judged against the image's real shape. When marks crowd one spot so closely that two numbers overlap at every corner, the plugin reports both annotations.

## Validation

The plugin adds a problem with any block to `meta.issues`, as [Validation](/guide/validation/) describes. A screenshot goes by its `src`, or by its position and `alt` when another screenshot shares it; an annotation goes by its position in its screenshot:

```txt
screenshot "after.png", annotation 2: the box runs past the image edge. Keep x + w and y + h within 100.
```

Unknown props are reported with the valid ones, and so is a `:bound` prop that points at missing frontmatter. Bindings to `data` or `props` are left to the renderer.

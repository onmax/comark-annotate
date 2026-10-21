import type { Annotation } from "./read.ts";

// Boxes are percentages but stamps and strokes are fixed sizes, so both are worked out for one rendered size: a compare
// column on a laptop, the narrowest common one, where a stamp covers the most.
const WIDTH = 420;
// An image without a `viewport` is taken to be 16:10.
const ASPECT = 0.625;
// Keep these in step with `.ca-stamp` and `.ca-mark .ca-stamp` in styles.ts.
const SIZE = 15;
const DIGIT = 5.5;
const GAP = 4;
// Each stamp draws a 2px ring, so two stamps closer than both rings would touch.
const CLEAR = 4;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An annotation's box in pixels at the reference size, which places the stamps and draws the marks. */
export function pixels(annotation: Pick<Annotation, "x" | "y" | "w" | "h">, aspect = ASPECT): Rect {
  const height = WIDTH * aspect;
  return {
    x: (annotation.x / 100) * WIDTH,
    y: (annotation.y / 100) * height,
    w: (annotation.w / 100) * WIDTH,
    h: (annotation.h / 100) * height,
  };
}

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

// Top corners first, since a number above its mark reads before it; left first, since the notes list reads that way.
const CORNERS = [
  [false, false],
  [true, false],
  [false, true],
  [true, true],
] as const;

export interface Placement {
  /** Where each stamp sits against its mark, as CSS offsets, by the annotation's `n`. */
  css: Map<number, string>;
  /** Numbered annotations whose stamps overlap at every corner, as their positions in the screenshot, counted from 1. */
  clashes: [number, number][];
}

/**
 * Puts each stamp outside a corner of its mark: the first corner, in order, where it covers no earlier stamp, then
 * the one that covers the least of the marks, their ticks, and their arrows. Against the image's edge a stamp slides
 * along it, and in a corner of the image it moves inside its mark.
 */
export function place(annotations: Annotation[], aspect = ASPECT): Placement {
  const height = WIDTH * aspect;
  const box = (annotation: Annotation) => pixels(annotation, aspect);
  const covered = annotations.flatMap((annotation) => {
    const { x, y, w, h } = box(annotation);
    const [cx, cy] = [x + w / 2, y + h / 2];
    return [
      { x, y, w, h },
      ...(annotation.mark === "check" ? [{ x: x + w + GAP, y: cy - 10, w: 20, h: 20 }] : []),
      ...(annotation.side === "right" ? [{ x: x + w, y: cy - 8, w: WIDTH - x - w, h: 16 }] : []),
      ...(annotation.side === "left" ? [{ x: 0, y: cy - 8, w: x, h: 16 }] : []),
      ...(annotation.side === "top" ? [{ x: cx - 12, y: 0, w: 24, h: y }] : []),
    ];
  });
  const css = new Map<number, string>();
  const clashes: [number, number][] = [];
  const placed: { index: number; numbered: boolean; rect: Rect }[] = [];
  for (const [index, annotation] of annotations.entries()) {
    const b = box(annotation);
    const w = SIZE + Math.max(0, String(annotation.number ?? "A").length - 1) * DIGIT;
    const numbered = annotation.number !== undefined;
    // A mark that draws nothing is only its number, which styles.ts keeps on the corner.
    if (annotation.mark === "none") {
      placed.push({
        index,
        numbered,
        rect: { x: b.x - SIZE / 2, y: b.y - SIZE / 2, w: SIZE, h: SIZE },
      });
      continue;
    }
    let best: { rect: Rect; css: string; hits: typeof placed; cost: [number, number] } | undefined;
    for (const [right, bottom] of CORNERS) {
      let x = right ? b.x + b.w + GAP : b.x - GAP - w;
      let y = bottom ? b.y + b.h + GAP : b.y - GAP - SIZE;
      const slideX = right ? x + w > WIDTH : x < 0;
      const slideY = bottom ? y + SIZE > height : y < 0;
      const inside = slideX && slideY;
      if (inside) x = right ? b.x + b.w - 3 - w : b.x + 3;
      else if (slideX) x = right ? b.x + b.w + GAP - w : b.x - GAP;
      if (inside) y = bottom ? b.y + b.h - 3 - SIZE : b.y + 3;
      else if (slideY) y = bottom ? b.y + b.h + GAP - SIZE : b.y - GAP;
      const [near, far] = right ? ["right", "left"] : ["left", "right"];
      const [edge, away] = bottom ? ["bottom", "top"] : ["top", "bottom"];
      const offset = (inner: boolean, slide: boolean, side: string, other: string) =>
        inner ? `${side}:3px` : slide ? `${side}:-${GAP}px` : `${other}:calc(100% + ${GAP}px)`;
      const rect = { x, y, w, h: SIZE };
      const ring = { x: x - CLEAR, y: y - CLEAR, w: w + 2 * CLEAR, h: SIZE + 2 * CLEAR };
      const hits = placed.filter((stamp) => overlap(ring, stamp.rect) > 0);
      const cost: [number, number] = [
        hits.reduce((sum, stamp) => sum + overlap(ring, stamp.rect), 0),
        covered.reduce((sum, area) => sum + overlap(rect, area), 0),
      ];
      if (!best || cost[0] < best.cost[0] || (cost[0] === best.cost[0] && cost[1] < best.cost[1]))
        best = {
          rect,
          css: `${offset(inside, slideX, near, far)};${offset(inside, slideY, edge, away)}`,
          hits,
          cost,
        };
      if (!cost[0] && !cost[1]) break;
    }
    // CORNERS isn't empty, so the loop always sets `best`.
    const chosen = best!;
    css.set(annotation.n, chosen.css);
    placed.push({ index, numbered, rect: chosen.rect });
    if (numbered)
      for (const stamp of chosen.hits)
        if (stamp.numbered) clashes.push([stamp.index + 1, index + 1]);
  }
  return { css, clashes };
}

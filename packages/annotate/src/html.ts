import type { ElementNode, Node, NodeHandler, State } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import { carouselHtml } from "comark-carousel/html";
import { runtime as zoomRuntime } from "comark-zoom/html";
import { marks } from "./marks.ts";
import { type Annotation, PALETTE, readCompare, readScreenshot, type Screenshot } from "./read.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { AnnotateMeta, Mark } from "./index.ts";

// Each render gets a fresh `state.context`: the first figure in a document carries the styles, and ids are
// counted per render.
const styled = new WeakSet<object>();
const counts = new WeakMap<object, Map<number, number>>();
function styles(state: State) {
  if (styled.has(state.context)) return "";
  styled.add(state.context);
  return `<style>${css}</style>`;
}

// Ids come from the images and their order, so they stay stable across renders and don't collide with a
// heading's id or with another document on the same page.
function idFor(shots: Screenshot[], state: State) {
  let hash = 2166136261;
  for (const char of shots.map((shot) => shot.src).join("|"))
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const seen = counts.get(state.context) ?? new Map<number, number>();
  counts.set(state.context, seen);
  const count = (seen.get(hash) ?? 0) + 1;
  seen.set(hash, count);
  return `ca-${(hash >>> 0).toString(36)}${count > 1 ? `-${count}` : ""}`;
}

const named = new Set<string>(PALETTE);
const paint = (color?: string) =>
  !color
    ? ""
    : named.has(color)
      ? `--ca-color:var(--ca-${color});--ca-solid:var(--ca-${color}-solid);--ca-ink:var(--ca-${color}-ink);`
      : `--ca-color:${color};--ca-solid:${color};`;

// A loose hand-drawn stroke that stretches between the mark and its note, and a head that keeps its size.
const ARROW = `<svg class="ca-arrow-line" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 10C30 3 62 17 98 9" vector-effect="non-scaling-stroke"/></svg>`;
const HEAD = `<svg class="ca-arrow-head" viewBox="0 0 8 8"><path d="M6.5 1.5L1.5 4l5 2.5" vector-effect="non-scaling-stroke"/></svg>`;
// The same stroke falling from a note above the image, with its head pointing down.
const ARROW_DOWN = `<svg class="ca-arrow-line" viewBox="0 0 24 100" preserveAspectRatio="none"><path d="M17 2C2 26 3 66 12 98" vector-effect="non-scaling-stroke"/></svg>`;
const HEAD_DOWN = `<svg class="ca-arrow-head" viewBox="0 0 8 8"><path d="M1.5 1.5L4 6.5l2.5-5" vector-effect="non-scaling-stroke"/></svg>`;

const attr = (value: string) => escapeHtml(value, { '"': "&quot;" });
const wrap = (nodes: Node[]): ElementNode => ["div", {}, ...nodes];
const children = (nodes: Node[], state: State) => state.flow(wrap(nodes), state);
// Comark restores shared render state after each node, so notes render one at a time to keep the output deterministic.
async function each<T>(items: T[], render: (item: T) => Promise<string>) {
  let html = "";
  for (const item of items) html += await render(item);
  return html;
}
const noteText = (annotation: Annotation) =>
  textContent(wrap(annotation.note)).trim().slice(0, 120);
const label = (annotation: Annotation) =>
  annotation.number ? `Annotation ${annotation.number}` : `Side note: ${noteText(annotation)}`;

function markSvg({ mark }: Annotation) {
  const { viewBox, paths } = marks[mark];
  const aspect = mark === "check" || mark === "cross" ? "" : ' preserveAspectRatio="none"';
  return `<svg viewBox="${viewBox}"${aspect} aria-hidden="true">${paths.map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join("")}</svg>`;
}

// `top` reserves room for notes above the image, so every image in a comparison starts at the same height.
async function figure(shot: Screenshot, state: State, id: string, top = false) {
  const color = (annotation: Annotation) => paint(annotation.color);
  const style = (annotation: Annotation) =>
    annotation.color ? ` style="${color(annotation)}"` : "";
  // Side notes get letters that only show when the notes stack under the image and the arrows are gone.
  const letters = new Map(
    shot.annotations
      .filter((annotation) => annotation.side)
      .map((annotation, index) => [annotation.n, String.fromCharCode(65 + (index % 26))]),
  );
  const letter = (annotation: Annotation) =>
    `<span class="ca-stamp ca-letter">${letters.get(annotation.n) ?? ""}</span>`;
  const stamp = (annotation: Annotation) =>
    annotation.number
      ? `<span class="ca-stamp">${annotation.number}</span>`
      : annotation.side
        ? letter(annotation)
        : "";
  // Marks aren't links: a click anywhere on the screenshot zooms it, notes included. Hovering a mark still lights up its note.
  const pins = shot.annotations.map(
    (annotation) =>
      `<span class="ca-mark ca-${annotation.mark}" data-n="${annotation.n}" role="img" aria-label="${attr(annotation.number ? `${label(annotation)}: ${noteText(annotation)}` : label(annotation))}" title="${attr(noteText(annotation))}" ` +
      `style="${color(annotation)}left:${annotation.x}%;top:${annotation.y}%;width:${annotation.w}%;height:${annotation.h}%">` +
      `${markSvg(annotation)}${stamp(annotation)}</span>`,
  );
  const listed = shot.annotations.filter((annotation) => !annotation.side);
  const notes = await each(
    listed,
    async (annotation) =>
      `<li id="${id}-${annotation.n}" data-n="${annotation.n}"${style(annotation)}>${stamp(annotation)}` +
      `<div>${await children(annotation.note, state)}</div></li>`,
  );
  const sided = shot.annotations.filter((annotation) => annotation.side);
  const center = (annotation: Annotation) => ({
    x: annotation.x + annotation.w / 2,
    y: annotation.y + annotation.h / 2,
  });
  const arrows = sided.map((annotation) => {
    const { x, y } = center(annotation);
    const place =
      annotation.side === "top"
        ? `left:${x}%;top:calc(-1 * var(--ca-gap));bottom:${100 - annotation.y}%`
        : annotation.side === "right"
          ? `top:${y}%;left:${annotation.x + annotation.w}%;right:calc(-1 * var(--ca-gap))`
          : `top:${y}%;left:calc(-1 * var(--ca-gap));right:${100 - annotation.x}%`;
    const [line, head] = annotation.side === "top" ? [ARROW_DOWN, HEAD_DOWN] : [ARROW, HEAD];
    return `<span class="ca-arrow ca-arrow-${annotation.side}" data-n="${annotation.n}" style="${color(annotation)}${place}" aria-hidden="true">${line}${head}</span>`;
  });
  // Side notes live outside the frame so the frame, and every percentage inside it, stays the size of the image.
  // A top note's x is a share of the frame, which sits between any left and right gutters.
  const callouts = await each(sided, async (annotation) => {
    const { x, y } = center(annotation);
    const place =
      annotation.side === "top"
        ? `left:calc(var(--ca-pl,0px) + (100% - var(--ca-pl,0px) - var(--ca-pr,0px)) * ${x / 100})`
        : `top:${y}%`;
    return (
      `<div class="ca-callout ca-callout-${annotation.side}" id="${id}-${annotation.n}" data-n="${annotation.n}" style="${color(annotation)}${place}">` +
      `${letter(annotation)}<div>${await children(annotation.note, state)}</div></div>`
    );
  });
  const sides = [
    ...new Set([
      ...sided.map((annotation) => ` ca-${annotation.side}`),
      ...(top ? [" ca-top"] : []),
    ]),
  ].join("");
  const heading = [
    shot.label && `<span class="ca-label">${escapeHtml(shot.label)}</span>`,
    shot.url && `<a href="${attr(shot.url)}" title="${attr(shot.url)}">Preview</a>`,
  ]
    .filter(Boolean)
    .join(" ");
  const caption = shot.caption.some((node) => Array.isArray(node) || node.trim() !== "")
    ? await children(shot.caption, state)
    : "";
  return (
    `<figure class="ca-screenshot${sides}" data-zoom tabindex="0" data-zoom-context=".ca" data-zoom-title="${attr(shot.label || shot.alt)}">${heading && `<div class="ca-heading">${heading}</div>`}<div class="ca-stage"><div class="ca-frame"><img src="${attr(shot.src)}" alt="${attr(shot.alt)}" loading="lazy" decoding="async">${pins.join("")}${arrows.join("")}</div>${callouts}</div>` +
    (caption || notes
      ? `<figcaption>${caption}${notes ? `<ol class="ca-notes">${notes}</ol>` : ""}</figcaption>`
      : "") +
    "</figure>"
  );
}

const screenshot: NodeHandler = async (node, state) => {
  const shot = readScreenshot(node, [], state.renderData);
  return `${styles(state)}<div class="ca">${await figure(shot, state, idFor([shot], state))}</div>${zoomRuntime(state)}`;
};

const compare: NodeHandler = async (node, state) => {
  const shots = readCompare(node, [], state.renderData);
  const id = idFor(shots, state);
  const top = shots.some((shot) =>
    shot.annotations.some((annotation) => annotation.side === "top"),
  );
  const figures: string[] = [];
  for (const shot of shots) figures.push(await figure(shot, state, id, top));
  // Side by side on a wide page, one at a time on a narrow one; both screenshots zoom as one gallery.
  return `${styles(state)}<div class="ca ca-compare">${carouselHtml(figures, { columns: 2, title: "Comparison" }, state)}</div>`;
};

/** HTML renderers for `::screenshot`, `::compare`, and `::annotation`. Pass them as `components`; the styles are inlined once per document. */
export const components: Record<"screenshot" | "compare" | "annotation", NodeHandler> = {
  screenshot,
  compare,
  // An annotation outside a screenshot has nothing to point at.
  annotation: () => "",
};

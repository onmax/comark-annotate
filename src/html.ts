import type { ElementNode, Node, NodeHandler, State } from "comark";
import { escapeHtml, textContent } from "comark/utils";
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
      ? `--ca-color:var(--ca-${color});--ca-ink:var(--ca-${color}-ink);`
      : `--ca-color:${color};`;

// A loose hand-drawn stroke that stretches between the mark and its note, and a head that keeps its size.
const ARROW = `<svg class="ca-arrow-line" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 10C30 3 62 17 98 9" vector-effect="non-scaling-stroke"/></svg>`;
const HEAD = `<svg class="ca-arrow-head" viewBox="0 0 8 8"><path d="M6.5 1.5L1.5 4l5 2.5" vector-effect="non-scaling-stroke"/></svg>`;

const attr = (value: string) => escapeHtml(value, { '"': "&quot;" });
const wrap = (nodes: Node[]): ElementNode => ["div", {}, ...nodes];
const children = (nodes: Node[], state: State) => state.flow(wrap(nodes), state);
// Comark restores shared render state after each node, so notes render one at a time to keep the output deterministic.
async function each<T>(items: T[], render: (item: T) => Promise<string>) {
  let html = "";
  for (const item of items) html += await render(item);
  return html;
}
const label = (annotation: Annotation) =>
  annotation.number
    ? `Annotation ${annotation.number}`
    : `Side note: ${textContent(wrap(annotation.note)).trim().slice(0, 80)}`;

function markSvg({ mark }: Annotation) {
  const { viewBox, paths } = marks[mark];
  const aspect = mark === "check" || mark === "cross" ? "" : ' preserveAspectRatio="none"';
  return `<svg viewBox="${viewBox}"${aspect} aria-hidden="true">${paths.map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join("")}</svg>`;
}

async function figure(shot: Screenshot, state: State, id: string) {
  const color = (annotation: Annotation) => paint(annotation.color);
  const style = (annotation: Annotation) =>
    annotation.color ? ` style="${color(annotation)}"` : "";
  const stamp = (annotation: Annotation) =>
    annotation.number ? `<span class="ca-stamp">${annotation.number}</span>` : "";
  const pins = shot.annotations.map(
    (annotation) =>
      `<a class="ca-mark ca-${annotation.mark}" data-n="${annotation.n}" href="#${id}-${annotation.n}" aria-label="${attr(label(annotation))}" ` +
      `style="${color(annotation)}left:${annotation.x}%;top:${annotation.y}%;width:${annotation.w}%;height:${annotation.h}%">` +
      `${markSvg(annotation)}${stamp(annotation)}</a>`,
  );
  const listed = shot.annotations.filter((annotation) => !annotation.side);
  const notes = await each(
    listed,
    async (annotation) =>
      `<li id="${id}-${annotation.n}" data-n="${annotation.n}"${style(annotation)}>${stamp(annotation)}` +
      `<div>${await children(annotation.note, state)}</div></li>`,
  );
  const sided = shot.annotations.filter((annotation) => annotation.side);
  const arrows = sided.map((annotation) => {
    const span =
      annotation.side === "right"
        ? `left:${annotation.x + annotation.w}%;right:calc(-1 * var(--ca-gap))`
        : `left:calc(-1 * var(--ca-gap));right:${100 - annotation.x}%`;
    return `<span class="ca-arrow ca-arrow-${annotation.side}" data-n="${annotation.n}" style="${color(annotation)}top:${annotation.y + annotation.h / 2}%;${span}" aria-hidden="true">${ARROW}${HEAD}</span>`;
  });
  // Side notes live outside the frame so the frame, and every percentage inside it, stays the size of the image.
  const callouts = await each(
    sided,
    async (annotation) =>
      `<div class="ca-callout ca-callout-${annotation.side}" id="${id}-${annotation.n}" data-n="${annotation.n}" style="${color(annotation)}top:${annotation.y + annotation.h / 2}%">` +
      `<div>${await children(annotation.note, state)}</div></div>`,
  );
  const sides = [...new Set(sided.map((annotation) => ` ca-${annotation.side}`))].join("");
  const heading = [
    shot.label && `<span class="ca-label">${escapeHtml(shot.label)}</span>`,
    shot.url &&
      `<a href="${attr(shot.url)}">${escapeHtml(shot.url.replace(/^https?:\/\//, ""))}</a>`,
  ]
    .filter(Boolean)
    .join(" ");
  const caption = shot.caption.some((node) => Array.isArray(node) || node.trim() !== "")
    ? await children(shot.caption, state)
    : "";
  return (
    `<figure class="ca-screenshot${sides}"><div class="ca-stage"><div class="ca-frame"><img src="${attr(shot.src)}" alt="${attr(shot.alt)}" loading="lazy" decoding="async">${pins.join("")}${arrows.join("")}</div>${callouts}</div>` +
    (heading || caption || notes
      ? `<figcaption>${heading && `<div class="ca-heading">${heading}</div>`}${caption}${notes ? `<ol class="ca-notes">${notes}</ol>` : ""}</figcaption>`
      : "") +
    "</figure>"
  );
}

const screenshot: NodeHandler = async (node, state) => {
  const shot = readScreenshot(node, [], state.renderData);
  return `${styles(state)}<div class="ca">${await figure(shot, state, idFor([shot], state))}</div>`;
};

const compare: NodeHandler = async (node, state) => {
  const shots = readCompare(node, [], state.renderData);
  const id = idFor(shots, state);
  return `${styles(state)}<div class="ca ca-compare">${await each(shots, (shot) => figure(shot, state, id))}</div>`;
};

/** HTML renderers for `::screenshot`, `::compare`, and `::annotation`. Pass them as `components`; the styles are inlined once per document. */
export const components: Record<"screenshot" | "compare" | "annotation", NodeHandler> = {
  screenshot,
  compare,
  // An annotation outside a screenshot has nothing to point at.
  annotation: () => "",
};

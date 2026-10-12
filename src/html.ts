import type { ElementNode, Node, NodeHandler, State } from "comark";
import { escapeHtml } from "comark/utils";
import { marks } from "./marks.ts";
import { type Annotation, readCompare, readScreenshot, type Screenshot } from "./read.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { AnnotateMeta, Mark } from "./index.ts";

// Each render gets a fresh `state.context`: the first figure in a document carries the styles, and ids stay unique.
const renders = new WeakMap<object, { figures: number }>();
function begin(state: State) {
  let render = renders.get(state.context);
  const first = !render;
  if (!render) renders.set(state.context, (render = { figures: 0 }));
  return { id: `ca${++render.figures}`, styles: first ? `<style>${css}</style>` : "" };
}

// Named colors each carry one meaning and adapt to dark mode; any other value is used as given.
const PALETTE = new Set(["red", "amber", "green", "blue", "gray"]);
const paint = (color?: string) =>
  !color
    ? ""
    : PALETTE.has(color)
      ? `--ca-color:var(--ca-${color});--ca-ink:var(--ca-${color}-ink);`
      : `--ca-color:${color};`;

// A loose hand-drawn stroke that stretches between the mark and its note, and a head that keeps its size.
const ARROW = `<svg class="ca-arrow-line" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 10C30 3 62 17 98 9" vector-effect="non-scaling-stroke"/></svg>`;
const HEAD = `<svg class="ca-arrow-head" viewBox="0 0 8 8"><path d="M6.5 1.5L1.5 4l5 2.5" vector-effect="non-scaling-stroke"/></svg>`;

const attr = (value: string) => escapeHtml(value, { '"': "&quot;" });
const children = (nodes: Node[], state: State) =>
  state.flow(["div", {}, ...nodes] as ElementNode, state);

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
      `<a class="ca-mark ca-${annotation.mark}" data-n="${annotation.n}" href="#${id}-${annotation.n}" aria-label="Annotation ${annotation.number ?? annotation.n}" ` +
      `style="${color(annotation)}left:${annotation.x}%;top:${annotation.y}%;width:${annotation.w}%;height:${annotation.h}%">` +
      `${markSvg(annotation)}${stamp(annotation)}</a>`,
  );
  const listed = shot.annotations.filter((annotation) => !annotation.side);
  const notes = await Promise.all(
    listed.map(
      async (annotation) =>
        `<li id="${id}-${annotation.n}" data-n="${annotation.n}"${style(annotation)}>${stamp(annotation)}` +
        `<div>${await children(annotation.note, state)}</div></li>`,
    ),
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
  const callouts = await Promise.all(
    sided.map(
      async (annotation) =>
        `<div class="ca-callout ca-callout-${annotation.side}" id="${id}-${annotation.n}" data-n="${annotation.n}" style="${color(annotation)}top:${annotation.y + annotation.h / 2}%">` +
        `<div>${await children(annotation.note, state)}</div></div>`,
    ),
  );
  const sides = [...new Set(sided.map((annotation) => ` ca-${annotation.side}`))].join("");
  const heading = [
    shot.label && `<span class="ca-label">${escapeHtml(shot.label)}</span>`,
    shot.url &&
      `<a href="${attr(shot.url)}">${escapeHtml(shot.url.replace(/^https?:\/\//, ""))}</a>`,
  ]
    .filter(Boolean)
    .join(" ");
  const caption = shot.caption.some((node) => typeof node !== "string" || node.trim())
    ? await children(shot.caption, state)
    : "";
  return (
    `<figure class="ca-screenshot${sides}"><div class="ca-stage"><div class="ca-frame"><img src="${attr(shot.src)}" alt="${attr(shot.alt)}" loading="lazy" decoding="async">${pins.join("")}${arrows.join("")}</div>${callouts.join("")}</div>` +
    (heading || caption || notes.length
      ? `<figcaption>${heading && `<div class="ca-heading">${heading}</div>`}${caption}${notes.length ? `<ol class="ca-notes">${notes.join("")}</ol>` : ""}</figcaption>`
      : "") +
    "</figure>"
  );
}

const screenshot: NodeHandler = async (node, state) => {
  const { id, styles } = begin(state);
  return `${styles}<div class="ca">${await figure(readScreenshot(node, []), state, id)}</div>`;
};

const compare: NodeHandler = async (node, state) => {
  const { id, styles } = begin(state);
  const shots = await Promise.all(readCompare(node, []).map((shot) => figure(shot, state, id)));
  return `${styles}<div class="ca ca-compare">${shots.join("")}</div>`;
};

/** HTML renderers for `::screenshot`, `::compare`, and `::annotation`. Pass them as `components`; the styles are inlined once per document. */
export const components: Record<"screenshot" | "compare" | "annotation", NodeHandler> = {
  screenshot,
  compare,
  // An annotation outside a screenshot has nothing to point at.
  annotation: () => "",
};

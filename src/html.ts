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

const attr = (value: string) => escapeHtml(value, { '"': "&quot;" });
const children = (nodes: Node[], state: State) =>
  state.flow(["div", {}, ...nodes] as ElementNode, state);

function markSvg({ mark }: Annotation) {
  const { viewBox, paths } = marks[mark];
  const aspect = mark === "check" || mark === "cross" ? "" : ' preserveAspectRatio="none"';
  return `<svg viewBox="${viewBox}"${aspect} aria-hidden="true">${paths.map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join("")}</svg>`;
}

async function figure(shot: Screenshot, state: State, id: string) {
  const color = (annotation: Annotation) =>
    annotation.color ? `--ca-color:${annotation.color};` : "";
  const style = (annotation: Annotation) =>
    annotation.color ? ` style="${color(annotation)}"` : "";
  const pins = shot.annotations.map(
    (annotation) =>
      `<a class="ca-mark ca-${annotation.mark}" data-n="${annotation.n}" href="#${id}-${annotation.n}" aria-label="Annotation ${annotation.n}" ` +
      `style="${color(annotation)}left:${annotation.x}%;top:${annotation.y}%;width:${annotation.w}%;height:${annotation.h}%">` +
      `${markSvg(annotation)}<span class="ca-stamp">${annotation.n}</span></a>`,
  );
  const notes = await Promise.all(
    shot.annotations.map(
      async (annotation) =>
        `<li id="${id}-${annotation.n}" data-n="${annotation.n}"${style(annotation)}><span class="ca-stamp">${annotation.n}</span>` +
        `<div>${await children(annotation.note, state)}</div></li>`,
    ),
  );
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
    `<figure class="ca-screenshot"><div class="ca-frame"><img src="${attr(shot.src)}" alt="${attr(shot.alt)}" loading="lazy" decoding="async">${pins.join("")}</div>` +
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

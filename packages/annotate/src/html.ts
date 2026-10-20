import type { ElementNode, Node, NodeHandler, State } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import { carouselHtml } from "comark-carousel/html";
import { runtime as zoomRuntime } from "comark-zoom/html";
import { start } from "./client.ts";
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

// Each render gets a fresh `state.context`, so a document carries the script for sliders and copying once.
const started = new WeakSet<object>();
function runtime(state: State) {
  if (started.has(state.context)) return "";
  started.add(state.context);
  return `<script>(${start.toString()})()</script>`;
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
// The stamp's number takes whichever of white or the dark ink contrasts more with a hex color, by WCAG luminance.
// read.ts only lets 3- and 6-digit hex through.
function ink(hex: string) {
  const full = hex.length === 4 ? hex.replaceAll(/[\da-f]/gi, (digit) => digit + digit) : hex;
  const [r, g, b] = [1, 3, 5].map((at) => {
    const channel = Number.parseInt(full.slice(at, at + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.0605 ? "#fff" : "#1c1917";
}
const paint = (color?: string) =>
  !color
    ? ""
    : named.has(color)
      ? `--ca-color:var(--ca-${color});--ca-solid:var(--ca-${color}-solid);--ca-ink:var(--ca-${color}-ink);`
      : `--ca-color:${color};--ca-solid:${color};--ca-ink:${ink(color)};`;

// A loose hand-drawn stroke that stretches between the mark and its note, and a head that keeps its size.
const ARROW = `<svg class="ca-arrow-line" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 10C30 3 62 17 98 9" vector-effect="non-scaling-stroke"/></svg>`;
const HEAD = `<svg class="ca-arrow-head" viewBox="0 0 8 8"><path d="M6.5 1.5L1.5 4l5 2.5" vector-effect="non-scaling-stroke"/></svg>`;
// The same stroke falling from a note above the image, with its head pointing down.
const ARROW_DOWN = `<svg class="ca-arrow-line" viewBox="0 0 24 100" preserveAspectRatio="none"><path d="M17 2C2 26 3 66 12 98" vector-effect="non-scaling-stroke"/></svg>`;
// Shown once the script starts and the browser can write images to the clipboard; a check replaces the icon once it has.
const COPY =
  `<button type="button" class="ca-copy" aria-label="Copy the screenshot with its marks" title="Copy with marks">` +
  `<svg class="ca-copy-idle" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>` +
  `<svg class="ca-copy-done" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></button>` +
  `<span class="ca-copy-status" role="status"></span>`;
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
// The link reads as the host it points at; `href` is already checked to be http or https.
function host(href: string) {
  try {
    return new URL(href).host || "Preview";
  } catch {
    return "Preview";
  }
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

// The pieces of a screenshot, which a figure stacks and a slider lays over each other.
async function parts(shot: Screenshot, state: State, id: string, copy = false) {
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
  // A note's x or y is a share of the frame, which sits between the gutters for notes beside and above it.
  const callouts = await each(sided, async (annotation) => {
    const { x, y } = center(annotation);
    const place =
      annotation.side === "top"
        ? `left:calc(var(--ca-pl,0px) + (100% - var(--ca-pl,0px) - var(--ca-pr,0px)) * ${x / 100})`
        : `top:calc(var(--ca-pt,0px) + (100% - var(--ca-pt,0px)) * ${y / 100})`;
    return (
      `<div class="ca-callout ca-callout-${annotation.side}" id="${id}-${annotation.n}" data-n="${annotation.n}" style="${color(annotation)}${place}">` +
      `${letter(annotation)}<div>${await children(annotation.note, state)}</div></div>`
    );
  });
  const heading = [
    shot.title && `<span class="ca-label">${escapeHtml(shot.title)}</span>`,
    shot.href &&
      `<a href="${attr(shot.href)}" title="${attr(shot.href)}">${escapeHtml(host(shot.href))}</a>`,
  ]
    .filter(Boolean)
    .join(" ");
  const caption = shot.caption.some((node) => Array.isArray(node) || node.trim() !== "")
    ? await children(shot.caption, state)
    : "";
  return {
    sides: sided.map((annotation) => ` ca-${annotation.side}`),
    heading: heading && `<div class="ca-heading">${heading}</div>`,
    frame: `<div class="ca-frame"><img src="${attr(shot.src)}" alt="${attr(shot.alt)}" loading="lazy" decoding="async">${pins.join("")}${arrows.join("")}${copy ? COPY : ""}</div>`,
    callouts,
    notes: caption || notes ? `${caption}${notes ? `<ol class="ca-notes">${notes}</ol>` : ""}` : "",
  };
}

// `top` reserves room for notes above the image, so every image in a comparison starts at the same height.
async function figure(shot: Screenshot, state: State, id: string, top = false) {
  const { sides, heading, frame, callouts, notes } = await parts(shot, state, id, true);
  const classes = [...new Set([...sides, ...(top ? [" ca-top"] : [])])].join("");
  return (
    `<figure class="ca-screenshot${classes}">${heading}<div class="ca-stage" data-zoom tabindex="0" data-zoom-context=".ca,.ca-screenshot" data-zoom-aside="figcaption" data-zoom-title="${attr(shot.title || shot.alt)}">${frame}${callouts}</div>` +
    (notes ? `<figcaption>${notes}</figcaption>` : "") +
    "</figure>"
  );
}

const GRIP = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${[5, 12, 19].map((y) => `<circle cx="9" cy="${y}" r="1.5"/><circle cx="15" cy="${y}" r="1.5"/>`).join("")}</svg>`;

// Without the script the two screenshots stack, each under its title. The script lays them over each other and lets
// the reader drag the divider; the notes stay under the pair, and beside it when zoomed.
async function slider(title: string | undefined, shots: Screenshot[], state: State, id: string) {
  const names = shots.map((shot) => shot.title || shot.alt);
  let sides = "";
  let notes = "";
  for (const [index, shot] of shots.entries()) {
    const part = await parts(shot, state, id);
    const which = index ? "after" : "before";
    sides += `<div class="ca-side ca-side-${which}">${part.heading}<div class="ca-stage">${part.frame}</div></div>`;
    if (part.notes)
      notes += `<div class="ca-side-notes ca-notes-${which}">${shot.title ? `<div class="ca-heading"><span class="ca-label">${escapeHtml(shot.title)}</span></div>` : ""}${part.notes}</div>`;
  }
  const handle =
    `<div class="ca-handle" role="slider" tabindex="0" aria-label="${attr(`Divider between ${names.join(" and ")}`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="${attr(`${names[0]} 50%, ${names[1]} 50%`)}">` +
    `<span class="ca-grip">${GRIP}</span></div>`;
  return (
    `<div class="ca ca-compare ca-slider"><div class="ca-swipe" data-zoom tabindex="0" data-zoom-context=".ca"${notes ? ' data-zoom-aside=".ca-swipe-notes"' : ""} data-zoom-title="${attr(title ?? names.join(" / "))}">${sides}${shots.length === 2 ? handle : ""}</div>` +
    `${notes && `<div class="ca-swipe-notes">${notes}</div>`}</div>${zoomRuntime(state)}${runtime(state)}`
  );
}

const screenshot: NodeHandler = async (node, state) => {
  const shot = readScreenshot(node, [], state.renderData);
  return `${styles(state)}<div class="ca">${await figure(shot, state, idFor([shot], state))}</div>${zoomRuntime(state)}${runtime(state)}`;
};

const compare: NodeHandler = async (node, state) => {
  const { title, mode, shots } = readCompare(node, [], state.renderData);
  const id = idFor(shots, state);
  if (mode === "slider") return `${styles(state)}${await slider(title, shots, state, id)}`;
  const top = shots.some((shot) =>
    shot.annotations.some((annotation) => annotation.side === "top"),
  );
  const figures: string[] = [];
  for (const shot of shots) figures.push(await figure(shot, state, id, top));
  // Side by side on a wide page, one at a time on a narrow one; both screenshots zoom as one gallery.
  return `${styles(state)}<div class="ca ca-compare">${carouselHtml(figures, { columns: 2, title: title ?? "Comparison" }, state)}</div>${runtime(state)}`;
};

/** HTML renderers for `::screenshot`, `::compare`, and `::annotation`. Pass them as `components`; the styles are inlined once per document. */
export const components: Record<"screenshot" | "compare" | "annotation", NodeHandler> = {
  screenshot,
  compare,
  // An annotation outside a screenshot has nothing to point at.
  annotation: () => "",
};

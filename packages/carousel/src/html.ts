import type { NodeHandler, State } from "comark";
import { escapeHtml } from "comark/utils";
import { runtime as zoomRuntime } from "comark-zoom/html";
import { start } from "./client.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";

// Each render gets a fresh `state.context`, so a document carries the script once.
const started = new WeakSet<object>();

/** The carousel script as one inline `<script>`, once per render. */
export function runtime(state: State): string {
  if (started.has(state.context)) return "";
  started.add(state.context);
  // The styles come inline before the script, so the script has nothing to add.
  return `<style data-comark-carousel>${css}</style><script>(${start.toString()})("")</script>`;
}

const attr = (value: unknown) => escapeHtml(String(value), { '"': "&quot;" });
const off = (value: unknown) => value === false || value === "false";

export interface CarouselOptions {
  /** How many slides show at once on a wide page: 1 to 3. */
  columns?: unknown;
  title?: unknown;
  /** Group the zoomable items inside the carousel, so the zoomed view pages through them. Default `true`. */
  gallery?: boolean;
}

function shell(count: number, options: CarouselOptions, track: string, state: State) {
  const columns = Math.min(3, Math.max(1, Number(options.columns) || 1));
  const gallery = options.gallery ?? true;
  const dots = Array.from(
    { length: count },
    (_, index) =>
      `<button type="button" class="cc-dot" data-carousel-to="${index}" aria-label="Slide ${index + 1}" aria-current="${index === 0}"></button>`,
  ).join("");
  const controls =
    count > 1
      ? `<div class="cc-controls"><button type="button" class="cc-step" data-carousel-step="-1" aria-label="Previous slide" disabled>\u2039</button><div class="cc-dots">${dots}</div><button type="button" class="cc-step" data-carousel-step="1" aria-label="Next slide">\u203a</button></div>`
      : "";
  return (
    `<div class="cc"${columns > 1 ? ` data-columns="${columns}"` : ""}${count <= columns ? " data-fits" : ""}${gallery ? " data-zoom-gallery" : ""} role="region" aria-roledescription="carousel" aria-label="${attr(options.title ?? "Carousel")}">` +
    `<div class="cc-track">${track}</div>${controls}</div>${gallery ? zoomRuntime(state) : ""}${runtime(state)}`
  );
}

/**
 * A carousel around slides that are already HTML, for plugins that build their own slides and decide what zooms
 * inside them. Adds the scripts once per render.
 */
export function carouselHtml(slides: string[], options: CarouselOptions, state: State): string {
  const track = slides
    .map(
      (slide, index) =>
        `<div class="cc-slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${slides.length}">${slide}</div>`,
    )
    .join("");
  return shell(slides.length, options, track, state);
}

const carousel: NodeHandler = async ([, attrs, ...children], state) =>
  shell(
    Number(attrs.count) || 0,
    { columns: attrs.columns, title: attrs.title, gallery: !off(attrs.zoom) },
    await state.flow(["div", {}, ...children], state),
    state,
  );

const slide: NodeHandler = async ([, attrs, ...children], state) => {
  const zoom = !off(attrs.zoom);
  const title = attrs.title === undefined ? "" : ` data-zoom-title="${attr(attrs.title)}"`;
  return `<div class="cc-slide" role="group" aria-roledescription="slide" aria-label="${attr(attrs.index)} of ${attr(attrs.count)}"${zoom ? ` data-zoom tabindex="0"${title}` : ""}>${await state.flow(["div", {}, ...children], state)}</div>`;
};

/** HTML renderers for `::carousel` and `:::slide`. Pass them as `components`. */
export const components: Record<"carousel" | "slide", NodeHandler> = { carousel, slide };

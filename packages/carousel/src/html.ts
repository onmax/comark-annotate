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
  return `<script>(${start.toString()})(${JSON.stringify(css).replaceAll("<", "\\u003c")})</script>`;
}

const attr = (value: unknown) => escapeHtml(String(value), { '"': "&quot;" });
const off = (value: unknown) => value === false || value === "false";

const carousel: NodeHandler = async ([, attrs, ...children], state) => {
  const count = Number(attrs.count) || 0;
  const columns = Math.min(3, Math.max(1, Number(attrs.columns) || 1));
  const zoom = !off(attrs.zoom);
  const dots = Array.from(
    { length: count },
    (_, index) =>
      `<button type="button" class="cc-dot" data-carousel-to="${index}" aria-label="Slide ${index + 1}" aria-current="${index === 0}"></button>`,
  ).join("");
  const controls =
    count > columns
      ? `<div class="cc-controls"><button type="button" class="cc-step" data-carousel-step="-1" aria-label="Previous slide" disabled>\u2039</button><div class="cc-dots">${dots}</div><button type="button" class="cc-step" data-carousel-step="1" aria-label="Next slide">\u203a</button></div>`
      : "";
  return (
    `<div class="cc"${columns > 1 ? ` data-columns="${columns}"` : ""}${zoom ? " data-zoom-gallery" : ""} role="region" aria-roledescription="carousel" aria-label="${attr(attrs.title ?? "Carousel")}">` +
    `<div class="cc-track">${await state.flow(["div", {}, ...children], state)}</div>${controls}</div>` +
    `${zoom ? zoomRuntime(state) : ""}${runtime(state)}`
  );
};

const slide: NodeHandler = async ([, attrs, ...children], state) => {
  const zoom = !off(attrs.zoom);
  const title = attrs.title === undefined ? "" : ` data-zoom-title="${attr(attrs.title)}"`;
  return `<div class="cc-slide" role="group" aria-roledescription="slide" aria-label="${attr(attrs.index)} of ${attr(attrs.count)}"${zoom ? ` data-zoom tabindex="0"${title}` : ""}>${await state.flow(["div", {}, ...children], state)}</div>`;
};

/** HTML renderers for `::carousel` and `:::slide`. Pass them as `components`. */
export const components: Record<"carousel" | "slide", NodeHandler> = { carousel, slide };

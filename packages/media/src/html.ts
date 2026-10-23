import type { NodeHandler } from "comark";
import { escapeHtml } from "comark/utils";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { MediaAttributes, MediaMeta } from "./index.ts";

// Each render gets a fresh `state.context`, so a document carries the styles once.
const styled = new WeakSet<object>();

const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);
const attr = (value: unknown) => escapeHtml(text(value), { '"': "&quot;" });

const media: NodeHandler = ([, attrs], state) => {
  const { kind, src, label, poster, autoplay, loop, muted } = attrs;
  if ((kind !== "video" && kind !== "audio") || !src) return "";
  const styles = styled.has(state.context) ? "" : `<style data-comark-media>${css}</style>`;
  styled.add(state.context);
  const video = kind === "video";
  return (
    `${styles}<${kind} class="cm" src="${attr(src)}" controls${video ? " playsinline" : ""} preload="metadata"` +
    (poster && video ? ` poster="${attr(poster)}"` : "") +
    (autoplay ? " autoplay" : "") +
    (loop ? " loop" : "") +
    (muted ? " muted" : "") +
    (label ? ` aria-label="${attr(label)}"` : "") +
    // Only a browser that can't play the file shows this.
    `><a href="${attr(src)}">${attr(label || src)}</a></${kind}>`
  );
};

/** The HTML renderer for videos and audio. Pass it as `components`; it inlines the styles once per document. */
export const components: Record<"media", NodeHandler> = { media };

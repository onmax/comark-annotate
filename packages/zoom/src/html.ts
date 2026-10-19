import type { NodeHandler, State } from "comark";
import { escapeHtml } from "comark/utils";
import { start } from "./client.ts";
import { RUNTIME_TAG } from "./index.ts";
import { css } from "./styles.ts";

export { default, RUNTIME_TAG } from "./index.ts";
export type { ZoomOptions } from "./index.ts";
export type { ZoomDetail } from "./client.ts";

// Each render gets a fresh `state.context`, so a document carries the script once.
const started = new WeakSet<object>();

/** The zoom script as one inline `<script>`, once per render. Other plugins call it for the items they make zoomable. */
export function runtime(state: State): string {
  if (started.has(state.context)) return "";
  started.add(state.context);
  // The styles come inline before the script, so the script has nothing to add.
  return `<style data-comark-zoom>${css}</style><script>(${start.toString()})("")</script>`;
}

const attr = (value: unknown) => escapeHtml(String(value), { '"': "&quot;" });

const zoom: NodeHandler = async ([, attrs, ...children], state) => {
  const extra = [
    attrs.group !== undefined && ` data-zoom-group="${attr(attrs.group)}"`,
    attrs.title !== undefined && ` data-zoom-title="${attr(attrs.title)}"`,
  ]
    .filter(Boolean)
    .join("");
  return `<div class="cz" data-zoom tabindex="0"${extra}>${await state.flow(["div", {}, ...children], state)}</div>${runtime(state)}`;
};

/** HTML renderers for `::zoom` and the script the plugin adds. Pass them as `components`. */
export const components: Record<"zoom" | typeof RUNTIME_TAG, NodeHandler> = {
  zoom,
  [RUNTIME_TAG]: (_node, state) => runtime(state),
};

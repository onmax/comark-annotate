import type { NodeHandler, State } from "comark";
import { buttons, start } from "./client.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { CodeAction, CodeOptions } from "./index.ts";
export type { CodeActionDetail } from "./client.ts";

// Each render gets a fresh `state.context`, so a document carries the script once.
const started = new WeakSet<object>();

/** The button script as one inline `<script>`, once per render. */
export function runtime(state: State): string {
  if (started.has(state.context)) return "";
  started.add(state.context);
  // The styles come inline before the script, so the script has nothing to add.
  return `<style data-comark-code>${css}</style><script>(${start.toString()})("")</script>`;
}

// The block renders as it would without the plugin, so Shiki's classes and the host's `pre` styles still apply. The
// script goes inside the wrapper, where it can't become the first or last child a host's rule picks.
const pre: NodeHandler = async ([tag, { actions, ...attrs }, ...children], state, parent) => {
  // The default handler writes the attributes Comark resolved for this node, not the node's own.
  const outer = state.renderData;
  const { actions: _, ...props } = outer.props;
  state.renderData = { ...outer, props };
  try {
    return (
      `<div class="ck">${(await state.handlers.html([tag, attrs, ...children], state, parent)).trimEnd()}` +
      `<div class="ck-bar">${buttons(actions, attrs)}</div>${runtime(state)}</div>`
    );
  } finally {
    state.renderData = outer;
  }
};

/** The HTML renderer for code blocks. Pass it as `components`. */
export const components: Record<"pre", NodeHandler> = { pre };

import type { ElementNode, Node, NodeHandler, State } from "comark";
import { escapeHtml } from "comark/utils";
import { start } from "./client.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { TabsMeta } from "./index.ts";

// Each render gets a fresh `state.context`, so a document carries the script once.
const started = new WeakSet<object>();

/** The tabs script as one inline `<script>`, once per render. */
export function runtime(state: State): string {
  if (started.has(state.context)) return "";
  started.add(state.context);
  // The styles come inline before the script, so the script has nothing to add.
  return `<style data-comark-tabs>${css}</style><script>(${start.toString()})("")</script>`;
}

const attr = (value: unknown) =>
  escapeHtml(
    // SAFETY: the parse plugin writes every attribute the renderer reads as a string.
    String(value as string),
    { '"': "&quot;" },
  );
const isItem = (node: Node): node is ElementNode => Array.isArray(node) && node[0] === "tabs-item";

function tabHtml(id: string, label: string, index: number) {
  return `<button type="button" class="ct-tab" role="tab" id="${id}-tab-${index}" aria-controls="${id}-panel-${index}" aria-selected="${index === 1}" tabindex="${index === 1 ? 0 : -1}">${escapeHtml(label)}</button>`;
}

const tabs: NodeHandler = async ([, attrs, ...children], state) => {
  const id = attr(attrs.uid);
  const labels = Array.isArray(attrs.labels) ? attrs.labels.map(String) : [];
  const panels = await Promise.all(
    children.filter(isItem).map(async ([, item, ...content]) => {
      const index = Number(item.index) || 1;
      return (
        `<div class="ct-panel" role="tabpanel" id="${id}-panel-${index}" aria-labelledby="${id}-tab-${index}" tabindex="0"${index > 1 ? " data-inactive" : ""}>` +
        `<div class="ct-caption">${escapeHtml(labels[index - 1] ?? "")}</div>${await state.flow(["div", {}, ...content], state)}</div>`
      );
    }),
  );
  return (
    `<div class="ct"${attrs.code ? " data-tabs-code" : ""}${attrs.sync ? ` data-tabs-sync="${attr(attrs.sync)}"` : ""}>` +
    `<div class="ct-list" role="tablist">${labels.map((label, at) => tabHtml(id, label, at + 1)).join("")}</div>` +
    `${panels.join("")}</div>${runtime(state)}`
  );
};

/** The HTML renderer for `::tabs` and `::code-group`. Pass it as `components`. */
export const components: Record<"tabs", NodeHandler> = { tabs };

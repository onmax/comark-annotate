import type { NodeHandler } from "comark";
import { escapeHtml } from "comark/utils";
import { allow, referrerPolicy } from "./client.ts";
import { css } from "./styles.ts";

export { default } from "./index.ts";
export type { EmbedAttributes, EmbedMeta, Size } from "./index.ts";

// Each render gets a fresh `state.context`, so a document carries the styles once.
const styled = new WeakSet<object>();

const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);
const attr = (value: unknown) => escapeHtml(text(value), { '"': "&quot;" });

const embed: NodeHandler = ([, attrs], state) => {
  const { provider, src, label, size, href, title, host } = attrs;
  if (!href) return "";
  const styles = styled.has(state.context) ? "" : `<style data-comark-embed>${css}</style>`;
  styled.add(state.context);
  if (!src)
    return `${styles}<a class="ce-card" href="${attr(href)}"><strong>${attr(title)}</strong><span>${attr(host)}</span></a>`;
  return (
    `${styles}<figure class="ce" data-provider="${attr(provider)}" data-size="${attr(size)}"><div class="ce-frame">` +
    `<iframe src="${attr(src)}" title="${attr(label)}" loading="lazy" allow="${allow}" allowfullscreen referrerpolicy="${referrerPolicy}"></iframe></div>` +
    `<figcaption><a href="${attr(href)}">${attr(title)}</a></figcaption></figure>`
  );
};

/** The HTML renderer for `::embed`. Pass it as `components`; it inlines the styles once per document. */
export const components: Record<"embed", NodeHandler> = { embed };

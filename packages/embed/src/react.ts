import { createElement, useEffect } from "react";
import { addStyles, allow, referrerPolicy } from "./client.ts";
import type { EmbedAttributes } from "./index.ts";

export { default } from "./index.ts";
export type { EmbedAttributes, EmbedMeta, Size } from "./index.ts";

/** `::embed` for `@comark/react`. */
export function Embed({ provider, src, label, size, href, title, host }: EmbedAttributes) {
  useEffect(addStyles, []);
  if (!href) return null;
  if (!src)
    return createElement(
      "a",
      { className: "ce-card", href },
      createElement("strong", null, title),
      createElement("span", null, host),
    );
  return createElement(
    "figure",
    { className: "ce", "data-provider": provider, "data-size": size },
    createElement(
      "div",
      { className: "ce-frame" },
      createElement("iframe", {
        src,
        title: label,
        loading: "lazy",
        allow,
        allowFullScreen: true,
        referrerPolicy,
      }),
    ),
    createElement("figcaption", null, createElement("a", { href }, title)),
  );
}

/** Pass these as `components` to `@comark/react`. */
export const components = { Embed };

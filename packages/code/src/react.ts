import { createElement, type ReactNode, useEffect } from "react";
import { buttons, css, start } from "./client.ts";

export { default } from "./index.ts";

type PreProps = {
  actions?: unknown;
  children?: ReactNode;
  [attribute: string]: unknown;
};

/** Code blocks for `@comark/react`. */
export function Pre({ actions, children, ...attrs }: PreProps) {
  useEffect(() => {
    return start(css);
  }, []);
  return createElement(
    "div",
    { className: "ck" },
    // Everything but `actions` belongs to the `pre` itself, such as Shiki's class and the block's language.
    createElement("pre", attrs, children),
    // The bar is static markup built from escaped text, the same string every renderer uses.
    createElement("div", {
      className: "ck-bar",
      dangerouslySetInnerHTML: { __html: buttons(actions) },
    }),
  );
}

/** Pass these as `components` to `@comark/react`. */
export const components = { Pre };

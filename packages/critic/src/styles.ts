import { theme } from "comark-zoom/theme";

/**
 * Styles for comments: a muted pill beside the text it's about, on the shared tokens. `<ins>`, `<del>`, and `<mark>`
 * keep the browser's styles. The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".ccm-comment"),
  ".ccm-comment{margin:0 .125em;padding:0 .375em;border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-accent);color:var(--_comark-muted);font-size:.875em}",
].join("")}}`;

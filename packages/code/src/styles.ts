import { theme } from "comark-zoom/theme";

/**
 * The button bar's styles, on the shared `--comark-*` tokens. The script adds them to the page once. The rules sit in
 * the `comark` layer, so any unlayered rule of the host's wins, except the one after it that wraps the lines.
 */
export const css = `@layer comark{${[
  theme(".ck"),
  // No padding, border, or new formatting context, so the block's own margins collapse through the wrapper and the
  // bar's top right corner is the block's.
  ".ck{position:relative}",
  ".ck-bar{display:none}",
  // The bar shows on hover and focus, so it covers the end of the first line only while the reader points at it, and
  // always on touch screens.
  "[data-code-ready] .ck-bar{position:absolute;top:.5rem;right:.5rem;display:flex;gap:.25rem;opacity:0;transition:opacity .15s ease}",
  ".ck:is(:hover,:focus-within)>.ck-bar,.ck-bar:has([data-state]){opacity:1}",
  "@media (hover:none){[data-code-ready] .ck-bar{opacity:1}}",
  ".ck-bar>button{display:grid;place-items:center;min-width:1.75rem;height:1.75rem;margin:0;padding:0;border:1px solid var(--_comark-border);border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 1px 2px rgb(0 0 0/.05);font:500 .75rem/1 var(--_comark-font);cursor:pointer;touch-action:manipulation;transition:background .15s ease}",
  ".ck-bar>.ck-action{padding:0 .5rem}",
  ".ck-bar>button:hover,.ck-wrap[aria-pressed='true']{background:var(--_comark-accent)}",
  ".ck-bar>button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ck-bar svg{width:.875rem;height:.875rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
  ".ck-copy-done,.ck-copy[data-state=done] .ck-copy-idle{display:none}",
  ".ck-copy[data-state=done] .ck-copy-done{display:block}",
  ".ck-status{position:absolute;top:calc(100% + .25rem);right:0;width:max-content;max-width:18rem;padding:.25rem .5rem;border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-foreground);color:var(--_comark-background);font:.75rem/1.25rem var(--_comark-font);pointer-events:none}",
  ".ck-status:empty{display:none}",
  "@media (pointer:coarse){.ck-bar>button{min-width:2.25rem;height:2.25rem}}",
].join("")}}${
  // The reader asked for it, and pages set `white-space` on code blocks with plain rules, which beat any layered one.
  ".ck[data-code-wrap]>pre,.ck[data-code-wrap]>pre>code{white-space:pre-wrap;overflow-wrap:anywhere}"
}`;

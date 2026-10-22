import { css as icons } from "comark-icon/client";
import { theme } from "comark-zoom/theme";

/**
 * The header's styles, on the shared `--comark-*` tokens, with `--ck-inset` and `--ck-button-size` for how far the
 * buttons sit from the block's top right corner and how big they are. The script adds them to the page once. The rules sit in the
 * `comark` layer, so any unlayered rule of the host's wins, except the two after it that make room for the header and
 * wrap the lines.
 */
export const css = `${icons}@layer comark{${[
  theme(".ck"),
  // No padding, border, or new formatting context, so the block's own margins collapse through the wrapper and the
  // header's top edge is the block's.
  ".ck{position:relative;--_ck-size:var(--ck-button-size,1.5rem);--_ck-inset:var(--ck-inset,.375rem);--_ck-bar:calc(var(--_ck-size) + 2 * var(--_ck-inset))}",
  // The header sits on the block's own background, in room the block makes above its first line, so it never covers
  // the code.
  ".ck-bar{position:absolute;inset:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:.125rem;height:var(--_ck-bar);padding:var(--_ck-inset) var(--_ck-inset) 0 1rem;box-sizing:border-box;user-select:none}",
  ".ck-title{min-width:0;margin-right:auto;overflow:hidden;color:var(--_comark-muted);font:.75rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-overflow:ellipsis;white-space:nowrap}",
  ".ck-bar>button{display:inline-flex;align-items:center;justify-content:center;gap:.25rem;min-width:var(--_ck-size);height:var(--_ck-size);margin:0;padding:0;border:1px solid transparent;border-radius:calc(var(--_comark-radius) - 4px);background:transparent;color:var(--_comark-muted);font:500 .75rem/1 var(--_comark-font);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background-color .15s ease,color .15s ease;visibility:hidden}",
  "[data-code-ready] .ck-bar>button{visibility:visible}",
  // Only an icon-only action carries `aria-label`.
  ".ck-bar>.ck-action:not([aria-label]){padding:0 .5rem}",
  ".ck-bar>.ck-action:not([aria-label]):has(.ci){padding-left:.375rem}",
  "@media (hover:hover){.ck-bar>button:hover{background:var(--_comark-accent);color:var(--_comark-foreground)}}",
  ".ck-wrap[aria-pressed='true']{background:var(--_comark-accent);color:var(--_comark-foreground)}",
  "@media (prefers-reduced-motion:no-preference){.ck-bar>button{transition:background-color .15s ease,color .15s ease,scale .15s ease-out}.ck-bar>button:active{scale:.96}}",
  ".ck-bar>button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ck-bar svg{width:.875rem;height:.875rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
  ".ck-bar .ci{--comark-icon-size:.875rem;vertical-align:0}",
  ".ck-copy-done,.ck-copy[data-state=done] .ck-copy-idle{display:none}",
  ".ck-copy[data-state=done] .ck-copy-done{display:block}",
  ".ck-status{position:absolute;top:calc(100% + .25rem);right:var(--_ck-inset);z-index:1;width:max-content;max-width:18rem;padding:.25rem .5rem;border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-foreground);color:var(--_comark-background);font:.75rem/1.25rem var(--_comark-font);pointer-events:none}",
  ".ck-status:empty{display:none}",
  "@media (pointer:coarse){.ck{--_ck-size:max(var(--ck-button-size,1.5rem),2.25rem)}}",
].join("")}}${
  // Pages set a code block's padding and `white-space` with plain rules, which beat any layered one.
  "div.ck>pre{padding-top:var(--_ck-bar)}" +
  ".ck[data-code-wrap]>pre,.ck[data-code-wrap]>pre>code{white-space:pre-wrap;overflow-wrap:anywhere}"
}`;

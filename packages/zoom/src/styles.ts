import { theme } from "./theme.ts";

/**
 * The zoom styles. The script adds them to the page once. Theme it with the shared `--comark-*` tokens; they resolve on
 * `.cz-dialog` itself, so tokens set there theme only the zoomed view. The rules sit in the `comark` layer, so any
 * unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cz-dialog,[data-zoom]"),
  "[data-zoom]{cursor:zoom-in}",
  "[data-zoom]:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:3px}",
  ".cz-dialog{position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;color:var(--_comark-foreground);font:13px/1.4 var(--_comark-font);outline:none}",
  ".cz-backdrop{position:absolute;inset:0;background:color-mix(in srgb,var(--_comark-background) 96%,transparent)}",
  ".cz-header{position:relative;display:flex;gap:.75rem;align-items:center;min-height:2.75rem;padding:0 .5rem 0 1rem}",
  ".cz-title{overflow:hidden;font-weight:500;white-space:nowrap;text-overflow:ellipsis}",
  ".cz-count{color:var(--_comark-muted);font-variant-numeric:tabular-nums}",
  ".cz-dialog button{display:inline-grid;place-items:center;border:0;border-radius:calc(var(--_comark-radius) - 2px);background:none;color:inherit;font:inherit;cursor:pointer}",
  ".cz-dialog button:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:1px}",
  ".cz-close{width:2.25rem;height:2.25rem;margin-left:auto;font-size:18px}",
  ".cz-close:hover,.cz-nav:hover{background:var(--_comark-accent)}",
  ".cz-stage{position:relative;display:grid;place-items:center;overflow:hidden}",
  ".cz-item{position:relative;transform-origin:center;cursor:auto}",
  // The copy keeps the item's width on the page, so its images can't grow past it to their natural size.
  ".cz-item img,.cz-thumb img{max-width:100%;height:auto}",
  ".cz-item>img,.cz-thumb>div>img{display:block;width:100%}",
  ".cz-layer{position:absolute;inset:0;pointer-events:none}",
  ".cz-layer>*{pointer-events:auto}",
  ".cz-nav{position:absolute;top:50%;width:2.5rem;height:2.5rem;font-size:22px;transform:translateY(-50%)}",
  ".cz-prev{left:.5rem}",
  ".cz-next{right:.5rem}",
  ".cz-footer{position:relative}",
  // The aside takes a column beside the stage, which the zoom fits into the space left; on a narrow screen, a band below.
  ".cz-header,.cz-footer{grid-column:1/-1}",
  ".cz-header{grid-row:1}",
  ".cz-stage{grid-row:2;grid-column:1}",
  ".cz-footer{grid-row:3}",
  ".cz-aside{display:none}",
  ".cz-dialog[data-aside]{grid-template-columns:minmax(0,1fr) minmax(14rem,22rem)}",
  ".cz-dialog[data-aside] .cz-aside{position:relative;display:block;grid-row:2;grid-column:2;align-self:center;max-height:100%;overflow:auto;padding:1rem 1.5rem 1rem .5rem}",
  "@media (max-width:48rem){.cz-dialog[data-aside]{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto auto}.cz-dialog[data-aside] .cz-aside{grid-row:3;grid-column:1;align-self:auto;max-height:30vh;padding:.5rem 1rem}.cz-dialog[data-aside] .cz-footer{grid-row:4}}",
  ".cz-strip{display:flex;gap:.5rem;justify-content:center;overflow-x:auto;padding:.75rem 1rem 1rem}",
  ".cz-strip .cz-thumb{position:relative;flex:none;width:6rem;height:4rem;overflow:hidden;border:1px solid var(--_comark-border);border-radius:calc(var(--_comark-radius) - 2px);opacity:.55;transition:opacity .15s}",
  ".cz-thumb:hover{opacity:.85}",
  ".cz-thumb[aria-current=true]{opacity:1;border-color:var(--_comark-foreground)}",
  ".cz-thumb>div{position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none}",
].join("")}}`;

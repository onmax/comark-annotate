import { theme } from "./theme.ts";

/**
 * The zoom styles. The script adds them to the page once. Theme it with the shared `--comark-*` tokens, or only the
 * zoomed view with `--cz-*`; nothing declares those, so they apply only where a host sets them. The rules sit in the
 * `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cz-dialog,[data-zoom]"),
  "[data-zoom]{cursor:zoom-in}",
  "[data-zoom]:focus-visible{outline:2px solid var(--cz-active,var(--_comark-ring));outline-offset:3px}",
  ".cz-dialog{position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;color:var(--cz-ink,var(--_comark-foreground));font:13px/1.4 var(--_comark-font);outline:none}",
  ".cz-backdrop{position:absolute;inset:0;background:var(--cz-backdrop,color-mix(in srgb,var(--_comark-background) 96%,transparent))}",
  ".cz-header{position:relative;display:flex;gap:.75rem;align-items:center;min-height:2.75rem;padding:0 .5rem 0 1rem}",
  ".cz-title{overflow:hidden;font-weight:500;white-space:nowrap;text-overflow:ellipsis}",
  ".cz-count{color:var(--cz-muted,var(--_comark-muted));font-variant-numeric:tabular-nums}",
  ".cz-dialog button{display:inline-grid;place-items:center;border:0;border-radius:calc(var(--_comark-radius) - 2px);background:none;color:inherit;font:inherit;cursor:pointer}",
  ".cz-dialog button:focus-visible{outline:2px solid var(--cz-active,var(--_comark-ring));outline-offset:1px}",
  ".cz-close{width:2.25rem;height:2.25rem;margin-left:auto;font-size:18px}",
  ".cz-close:hover,.cz-nav:hover{background:var(--cz-hover,var(--_comark-accent))}",
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
  ".cz-strip{display:flex;gap:.5rem;justify-content:center;overflow-x:auto;padding:.75rem 1rem 1rem}",
  ".cz-strip .cz-thumb{position:relative;flex:none;width:6rem;height:4rem;overflow:hidden;border:1px solid var(--cz-line,var(--_comark-border));border-radius:calc(var(--_comark-radius) - 2px);opacity:.55;transition:opacity .15s}",
  ".cz-thumb:hover{opacity:.85}",
  ".cz-thumb[aria-current=true]{opacity:1;border-color:var(--cz-active,var(--_comark-foreground))}",
  ".cz-thumb>div{position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none}",
].join("")}}`;

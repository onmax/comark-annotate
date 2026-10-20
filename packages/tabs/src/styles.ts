import { theme } from "comark-zoom/theme";

/**
 * The tab styles, after shadcn/ui's Tabs. The script adds them to the page once. Theme them with the shared `--comark-*`
 * tokens. The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".ct"),
  ".ct{margin:1.5rem 0}",
  // Without the script, every panel shows under a caption with its label, and the strip that couldn't switch them hides.
  ".ct-list{display:none;width:fit-content;max-width:100%;gap:.125rem;padding:3px;overflow-x:auto;scrollbar-width:none;border-radius:var(--_comark-radius);background:var(--_comark-accent)}",
  "[data-tabs-ready] .ct-list{display:flex}",
  "[data-tabs-ready] .ct-caption,[data-tabs-ready] .ct-panel[data-inactive]{display:none}",
  ".ct-tab{flex:none;padding:.25rem .75rem;border:0;border-radius:calc(var(--_comark-radius) - 2px);background:none;color:var(--_comark-muted);font:500 .875rem/1.25rem var(--_comark-font);white-space:nowrap;cursor:pointer;touch-action:manipulation;transition:color .15s,background .15s}",
  ".ct-tab:hover{color:var(--_comark-foreground)}",
  ".ct-tab[aria-selected='true']{background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 1px 2px rgb(0 0 0/.08)}",
  ".ct-tab:focus-visible,.ct-panel:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ct-panel{border-radius:var(--_comark-radius)}",
  "[data-tabs-ready] .ct-panel{margin-top:.75rem}",
  "[data-tabs-ready] .ct[data-tabs-code]>.ct-panel{margin-top:.5rem}",
  ".ct-caption{margin:1.25rem 0 .5rem;color:var(--_comark-muted);font:500 .75rem/1rem var(--_comark-font)}",
  ".ct-list+.ct-panel>.ct-caption{margin-top:0}",
  ".ct-caption+*{margin-top:0}",
  ".ct-panel>:last-child{margin-bottom:0}",
  "@media (pointer:coarse){.ct-tab{padding-block:.5rem}}",
].join("")}}`;

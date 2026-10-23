import { theme } from "comark-zoom/theme";

/**
 * Cards in a two-column grid, in the style of Nuxt UI's prose cards, and columns from `::columns`, on the shared
 * `--comark-*` tokens. A card's color tints its icon and, on a link card, its hovered border; each reads Nuxt UI's
 * `--ui-*` variable when the page has it, then `--ccr-*`. The rules sit in the `comark` layer, so any unlayered rule of
 * the host's wins.
 */
export const css = `@layer comark{${[
  theme(".ccr,.ccr-group,.ccr-columns"),
  ":where(.ccr){--ccr-primary:var(--ui-primary,#16a34a);--ccr-secondary:var(--ui-secondary,#2563eb);--ccr-success:var(--ui-success,#16a34a);--ccr-info:var(--ui-info,#2563eb);--ccr-warning:var(--ui-warning,#ca8a04);--ccr-error:var(--ui-error,#dc2626);--ccr-neutral:var(--_comark-foreground)}",
  "@media (prefers-color-scheme:dark){:where(.ccr){--ccr-primary:var(--ui-primary,#4ade80);--ccr-secondary:var(--ui-secondary,#60a5fa);--ccr-success:var(--ui-success,#4ade80);--ccr-info:var(--ui-info,#60a5fa);--ccr-warning:var(--ui-warning,#facc15);--ccr-error:var(--ui-error,#f87171)}}",
  ".ccr-group,.ccr-columns{display:grid;gap:1.25rem;margin:1.5rem 0}",
  "@media (min-width:40rem){.ccr-group{grid-template-columns:repeat(2,minmax(0,1fr))}",
  ...[2, 3, 4, 5, 6].map(
    (cols) =>
      `.ccr-columns[data-cols='${cols}']{grid-template-columns:repeat(${cols},minmax(0,1fr))}`,
  ),
  "}",
  ".ccr-group>.ccr{margin:0}",
  ".ccr-column>:first-child{margin-top:0}",
  ".ccr-column>:last-child{margin-bottom:0}",
  ".ccr{--ccr:var(--ccr-primary);position:relative;margin:1.5rem 0;padding:1.25rem 1.5rem;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-muted);font:400 .875rem/1.5rem var(--_comark-font);transition:background-color .15s,border-color .15s}",
  ...["secondary", "success", "info", "warning", "error", "neutral"].map(
    (color) => `.ccr[data-color='${color}']{--ccr:var(--ccr-${color})}`,
  ),
  ".ccr>:last-child{margin-bottom:0}",
  ".ccr>.ci{display:block;margin-bottom:.75rem;font-size:1.75rem;color:var(--ccr)}",
  ".ccr-title{margin:0 0 .25rem;color:var(--_comark-foreground);font-size:1rem;font-weight:600}",
  ".ccr-title+*{margin-top:0}",
  // The link covers the card, so a click anywhere opens it; links in the card's text stay on top.
  ".ccr-link{position:absolute;inset:0;z-index:0;border-radius:inherit}",
  ".ccr-link:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ccr :is(a,button):not(.ccr-link){position:relative;z-index:1}",
  ".ccr:has(>.ccr-link):hover{border-color:color-mix(in srgb,var(--ccr) 50%,var(--_comark-border));background:color-mix(in srgb,var(--_comark-accent) 50%,var(--_comark-background))}",
  ".ccr-external{position:absolute;top:.75rem;inset-inline-end:.75rem;width:1rem;height:1rem;color:var(--_comark-muted)}",
  ".ccr:dir(rtl) .ccr-external{scale:-1 1}",
  "@media print{.ccr{break-inside:avoid}.ccr-external{display:none}}",
].join("")}}`;

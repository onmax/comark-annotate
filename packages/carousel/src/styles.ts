import { theme } from "comark-zoom/client";

/**
 * The carousel styles. The script adds them to the page once. Theme the controls with the shared `--comark-*` tokens,
 * override `--cc-gap` for the space between slides and `--cc-surface` for the panel behind each one. The rules sit in
 * the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cc"),
  ":where(.cc){--cc-columns:1;--cc-gap:1rem;--cc-surface:color-mix(in srgb,var(--_comark-foreground) 4%,transparent)}",
  ".cc{position:relative;margin:1.5rem 0;container-type:inline-size}",
  ".cc[data-columns='2']{--cc-columns:2}",
  ".cc[data-columns='3']{--cc-columns:3}",
  ".cc-track{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - (var(--cc-columns) - 1) * var(--cc-gap)) / var(--cc-columns));gap:var(--cc-gap);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none}",
  ".cc-track::-webkit-scrollbar{display:none}",
  // Every slide is a panel as tall as the tallest one, with its content in the middle, so a short screenshot next to
  // a tall one sits on a stage rather than above a gap. Only slides in a track: the zoomed copy stays bare.
  ".cc-track>.cc-slide{min-width:0;scroll-snap-align:start;align-content:center;padding:1rem;border-radius:var(--_comark-radius);background:var(--cc-surface)}",
  ".cc-slide>:first-child{margin-top:0}",
  ".cc-slide>:last-child{margin-bottom:0}",
  ".cc-slide img{display:block;max-width:100%;height:auto;margin-inline:auto}",
  // Several columns need room; a narrow page shows one slide at a time, with less padding to spare its width.
  "@container (max-width:36rem){.cc-track{grid-auto-columns:100%}.cc-track>.cc-slide{padding:.5rem}}",
  // One quiet row under the slides, as in Embla's examples: where you are on the left, shadcn's outline icon buttons
  // on the right. It needs no gutter beside the slides, so it stays the same on a phone.
  ".cc-controls{display:none;align-items:center;justify-content:space-between;gap:.5rem;margin-top:.75rem}",
  "[data-carousel-ready] .cc-controls{display:flex}",
  // Slides that all fit side by side need no controls, until a narrow page shows them one at a time.
  "@container (min-width:36.01rem){.cc[data-fits] .cc-controls{display:none!important}}",
  ".cc-count{color:var(--_comark-muted);font-size:.875rem;line-height:1.25rem;font-variant-numeric:tabular-nums}",
  ".cc-steps{display:flex;gap:.5rem}",
  ".cc-step{display:inline-grid;place-items:center;width:2rem;height:2rem;padding:0;border:1px solid var(--_comark-border);border-radius:999px;background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 1px 2px rgb(0 0 0/.05);cursor:pointer;touch-action:manipulation;transition:background .15s,opacity .15s}",
  ".cc-step:hover:not(:disabled){background:var(--_comark-accent)}",
  ".cc-step:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".cc-step:disabled{opacity:.5;cursor:default}",
  ".cc-step svg{width:1rem;height:1rem}",
  // A finger needs a bigger target than a pointer.
  "@media (pointer:coarse){.cc-step{width:2.5rem;height:2.5rem}}",
].join("")}}`;

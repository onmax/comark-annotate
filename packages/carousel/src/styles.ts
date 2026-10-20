import { theme } from "comark-zoom/client";

/**
 * The carousel styles. The script adds them to the page once. Theme the controls with the shared `--comark-*` tokens
 * and override `--cc-gap` for the space between slides. The rules sit in the `comark` layer, so any unlayered rule of
 * the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cc"),
  ":where(.cc){--cc-columns:1;--cc-gap:1rem}",
  ".cc{position:relative;margin:1.5rem 0;container-type:inline-size}",
  ".cc[data-columns='2']{--cc-columns:2}",
  ".cc[data-columns='3']{--cc-columns:3}",
  // The row is as tall as the tallest slide, so a shorter one sits in the middle rather than above a gap.
  ".cc-track{position:relative;display:grid;grid-auto-flow:column;align-items:center;grid-auto-columns:calc((100% - (var(--cc-columns) - 1) * var(--cc-gap)) / var(--cc-columns));gap:var(--cc-gap);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none}",
  ".cc-track::-webkit-scrollbar{display:none}",
  ".cc-slide{min-width:0;scroll-snap-align:start}",
  ".cc-slide>:first-child{margin-top:0}",
  ".cc-slide>:last-child{margin-bottom:0}",
  ".cc-slide img{max-width:100%;height:auto}",
  // Several columns need room; a narrow page shows one slide at a time.
  "@container (max-width:36rem){.cc-track{grid-auto-columns:100%}}",
  ".cc-controls{display:none;gap:.25rem;align-items:center;justify-content:center;margin-top:.75rem}",
  "[data-carousel-ready] .cc-controls{display:flex}",
  // Slides that all fit side by side need no controls, until a narrow page shows them one at a time.
  "@container (min-width:36.01rem){.cc[data-fits] .cc-controls{display:none!important}}",
  // shadcn's outline icon button for the arrows, its ghost hover for the dots.
  ".cc-controls button{display:inline-grid;place-items:center;padding:0;border:0;border-radius:999px;background:none;color:var(--_comark-foreground);font:inherit;cursor:pointer;transition:background .15s,opacity .15s}",
  ".cc-controls button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".cc-controls .cc-step{width:2rem;height:2rem;border:1px solid var(--_comark-border);background:var(--_comark-background);box-shadow:0 1px 2px rgb(0 0 0/.05);font-size:18px;line-height:1}",
  ".cc-controls .cc-step:hover:not(:disabled){background:var(--_comark-accent)}",
  ".cc-step:disabled{opacity:.5;cursor:default}",
  ".cc-dot{width:1.25rem;height:1.25rem}",
  ".cc-dot::before{content:'';width:.375rem;height:.375rem;border-radius:999px;background:var(--_comark-foreground);opacity:.2;transition:opacity .15s}",
  ".cc-dot:hover::before{opacity:.45}",
  ".cc-dot[aria-current=true]::before{opacity:1}",
].join("")}}`;

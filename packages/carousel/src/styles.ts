/** The carousel styles. The script adds them to the page once; override `--cc-gap` to change the space between slides. */
export const css = [
  ".cc{--cc-columns:1;--cc-gap:1rem;position:relative;margin:1.5rem 0;container-type:inline-size}",
  ".cc[data-columns='2']{--cc-columns:2}",
  ".cc[data-columns='3']{--cc-columns:3}",
  ".cc-track{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - (var(--cc-columns) - 1) * var(--cc-gap)) / var(--cc-columns));gap:var(--cc-gap);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none}",
  ".cc-track::-webkit-scrollbar{display:none}",
  ".cc-slide{min-width:0;scroll-snap-align:start}",
  ".cc-slide>:first-child{margin-top:0}",
  ".cc-slide>:last-child{margin-bottom:0}",
  // Several columns need room; a narrow page shows one slide at a time.
  "@container (max-width:36rem){.cc-track{grid-auto-columns:100%}}",
  ".cc-controls{display:none;gap:.25rem;align-items:center;justify-content:center;margin-top:.75rem}",
  "[data-carousel-ready] .cc-controls{display:flex}",
  ".cc-controls button{display:inline-grid;place-items:center;border:0;border-radius:6px;background:none;color:inherit;font:inherit;cursor:pointer}",
  ".cc-controls button:focus-visible{outline:2px solid currentColor;outline-offset:1px}",
  ".cc-step{width:2rem;height:2rem;font-size:20px;line-height:1}",
  ".cc-step:hover{background:rgb(127 127 127/.15)}",
  ".cc-step:disabled{opacity:.3;cursor:default}",
  ".cc-dot{width:1.25rem;height:1.25rem}",
  ".cc-dot::before{content:'';width:.4rem;height:.4rem;border-radius:999px;background:currentColor;opacity:.25;transition:opacity .15s}",
  ".cc-dot[aria-current=true]::before{opacity:.85}",
].join("");

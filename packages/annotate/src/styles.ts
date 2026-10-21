import { theme } from "comark-zoom/client";
import { caveat } from "./font.ts";

// Hovering, focusing, or linking to a mark or its note sets `--ca-on` on both, so each lights up the other without a script.
// The zoomed view holds the screenshot and its notes in separate copies, so the dialog links those two, and only those:
// its thumbnails are copies too.
const zoomed = ":is(.cz-item,.cz-aside)";
const linked = Array.from({ length: 40 }, (_, index) => {
  const n = `[data-n="${index + 1}"]`;
  return (
    `.ca:has(${n}:is(:hover,:focus-visible,:target)) ${n}{--ca-on:1}` +
    `.cz-dialog:has(${zoomed} ${n}:is(:hover,:focus-visible)) ${zoomed} ${n}{--ca-on:1}`
  );
});

export const css = `@layer comark{${[
  // Notes and labels sit on hand-drawn marks, so they're handwritten too. No handwriting font ships with every system, so it comes inlined.
  `@font-face{font-family:comark-caveat;src:url(data:font/woff2;base64,${caveat}) format("woff2");font-display:block}`,
  // Surfaces, borders, and radii follow the shared `--comark-*` tokens; the mark colors stay their own.
  theme(".ca"),
  // One meaning per color: blue points something out (the default), red flags a problem, amber a warning, green a fix, gray anything neutral.
  // Strokes, arrows, and notes use the color, which lightens in dark mode. Stamps use a deeper solid shade in both themes,
  // so their number stays white (5:1 or better); only amber keeps a dark number.
  // Declared on `.ca` alone and at zero specificity, so a host's plain `.ca { --ca-color: … }` reaches every mark. A
  // zoomed screenshot sits in a copy of its `.ca`, so it keeps them too.
  ":where(.ca){--ca-note-font:comark-caveat,cursive;--ca-note-size:1.25em;--ca-label-size:1.5em;--ca-gutter:10rem;--ca-top-gutter:5rem;--ca-gap:1.25rem;--ca-red:#ee3533;--ca-amber:#f5a524;--ca-green:#259f56;--ca-blue:#0581e6;--ca-gray:#71717a;--ca-red-solid:#d01d21;--ca-amber-solid:#f59e0b;--ca-green-solid:#037e3f;--ca-blue-solid:#0267c7;--ca-gray-solid:#52525b;--ca-red-ink:#fff;--ca-amber-ink:#1c1917;--ca-green-ink:#fff;--ca-blue-ink:#fff;--ca-gray-ink:#fff;--ca-color:var(--ca-blue);--ca-solid:var(--ca-blue-solid);--ca-ink:var(--ca-blue-ink)}",
  ":where(.ca){margin:1.5rem 0}",
  "@media (prefers-color-scheme:dark){:where(.ca){--ca-red:#fd736d;--ca-amber:#ffb224;--ca-green:#59d38c;--ca-blue:#67b0f9;--ca-gray:#a1a1aa}}",
  // Before and after are bare and line up at the top, even when one screenshot is taller.
  ".ca-compare .cc{margin:0;--cc-gap:1.5rem}",
  ".ca-compare .cc-track>.cc-slide{align-content:start;padding:0;background:none}",
  // A slider without its script stacks the pair, each under its title.
  ".ca-slider{container-type:inline-size}",
  ".ca-swipe{display:grid;gap:1.5rem}",
  ".ca-handle{display:none}",
  // With it, both screenshots share one cell and each shows on its own side of the divider; the titles stay above.
  "[data-annotate-ready] .ca-swipe{--ca-split:50%;grid-template-columns:1fr 1fr;gap:0;touch-action:pan-y;-webkit-user-select:none;user-select:none}",
  "[data-annotate-ready] .ca-side{display:contents}",
  "[data-annotate-ready] .ca-side-before>.ca-heading{grid-area:1/1}",
  "[data-annotate-ready] .ca-side-after>.ca-heading{grid-area:1/2;justify-content:flex-end}",
  "[data-annotate-ready] .ca-swipe .ca-stage{grid-area:2/1/3/3;align-self:start}",
  "[data-annotate-ready] .ca-side-before>.ca-stage{clip-path:inset(0 calc(100% - var(--ca-split)) 0 0)}",
  "[data-annotate-ready] .ca-side-after>.ca-stage{clip-path:inset(0 0 0 var(--ca-split))}",
  ".ca-swipe img{-webkit-user-drag:none}",
  // A thin line with a round grip, as in React Bits' comparison slider. The shadow keeps it visible on a white page.
  "[data-annotate-ready] .ca-handle{grid-area:2/1/3/3;position:relative;left:var(--ca-split);display:block;width:0;outline:none;cursor:ew-resize;touch-action:none}",
  ".ca-handle::before{content:'';position:absolute;inset:0 auto 0 -1px;width:2px;background:var(--_comark-background);box-shadow:0 0 0 .5px rgb(0 0 0/.15),0 0 10px rgb(0 0 0/.25)}",
  ".ca-grip{position:absolute;top:50%;left:0;display:grid;place-items:center;width:2rem;height:2rem;border-radius:999px;background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 0 0 1px var(--_comark-border),0 2px 8px rgb(0 0 0/.25);transform:translate(-50%,-50%);transition:transform .15s ease,box-shadow .15s ease}",
  ".ca-grip svg{width:1rem;height:1rem}",
  ".ca-swipe[data-dragging]{cursor:ew-resize}",
  ".ca-swipe[data-dragging] .ca-grip{transform:translate(-50%,-50%) scale(1.1)}",
  ".ca-handle:focus-visible .ca-grip{box-shadow:0 0 0 1px var(--_comark-border),0 0 0 4px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  "@media (pointer:coarse){.ca-grip{width:2.5rem;height:2.5rem}}",
  "@media (prefers-reduced-motion:reduce){.ca-grip{transition:none}}",
  // Each screenshot's notes sit under its own side, and stack on a narrow page.
  ".ca-swipe-notes{display:grid;grid-template-columns:1fr 1fr;gap:.75rem 1.5rem;margin-top:.75rem}",
  ".ca-notes-after{grid-column:2}",
  "@container (max-width:36rem){.ca-swipe-notes{grid-template-columns:1fr}.ca-notes-after{grid-column:auto}}",
  ".ca-swipe-notes .ca-notes{margin-top:0}",
  ".ca-screenshot{margin:0;container-type:inline-size}",
  ".ca-stage{position:relative}",
  ".ca-right .ca-stage{--ca-pr:var(--ca-gutter);padding-right:var(--ca-gutter)}",
  ".ca-left .ca-stage{--ca-pl:var(--ca-gutter);padding-left:var(--ca-gutter)}",
  ".ca-top .ca-stage{--ca-pt:var(--ca-top-gutter);padding-top:var(--ca-top-gutter)}",
  ".ca-frame{position:relative;line-height:0}",
  ".ca-frame img{display:block;width:100%;height:auto;margin:0;border-radius:calc(var(--_comark-radius) - 4px);outline:1px solid var(--_comark-border);outline-offset:-1px}",
  // The Copy button shows on hover and focus, and always on touch screens and when zoomed.
  ".ca-copy{display:none}",
  "[data-annotate-copy] .ca-copy{position:absolute;top:.5rem;right:.5rem;display:grid;place-items:center;width:1.75rem;height:1.75rem;padding:0;border:1px solid var(--_comark-border);border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 1px 2px rgb(0 0 0/.05);cursor:pointer;opacity:0;transition:opacity .15s ease,background .15s ease}",
  ".ca-copy:hover{background:var(--_comark-accent)}",
  ".ca-copy:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ca-screenshot:is(:hover,:focus-visible) .ca-copy,.ca-copy:focus-visible,.ca-copy[data-state],.cz-dialog .ca-copy{opacity:1}",
  "@media (hover:none){[data-annotate-copy] .ca-copy{opacity:1}}",
  ".ca-copy svg{width:.875rem;height:.875rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
  ".ca-copy-done,.ca-copy[data-state=done] .ca-copy-idle{display:none}",
  ".ca-copy[data-state=done] .ca-copy-done{display:block}",
  ".ca-copy-status{position:absolute;top:.5rem;right:2.75rem;max-width:min(18rem,calc(100% - 3.5rem));padding:.25rem .5rem;box-sizing:border-box;border-radius:calc(var(--_comark-radius) - 4px);background:var(--_comark-foreground);color:var(--_comark-background);font-family:var(--_comark-font);font-size:.75rem;line-height:1.25rem;pointer-events:none}",
  ".ca-copy-status:empty{display:none}",
  // The copy behind the browser's menu: invisible, and in the way only for a right-click.
  ".ca-frame .ca-overlay{position:absolute;inset:0;width:100%;height:100%;opacity:0;outline:none;pointer-events:none}",
  ".ca-frame .ca-overlay[data-menu]{pointer-events:auto}",
  // A copy paints the marks at rest, and nothing animates while it reads them.
  "[data-ca-capture] *{transition:none!important}",
  "[data-ca-capture=still] *{--ca-on:0!important}",
  ".ca-mark{position:absolute;color:var(--ca-color);text-decoration:none;outline:none}",
  // Strokes are the solid color 65% of the mark's color over the page would give, so they outline the area without
  // competing with the screenshot; hovering a mark or its note brings it to full color.
  ".ca-mark,.ca-arrow{--ca-stroke:color-mix(in srgb,var(--ca-color) calc(65% + 35% * var(--ca-on,0)),var(--_comark-background))}",
  // A dark page would muddy them, but screenshots stay light, so dark mode mixes the deeper shade with white instead.
  "@media (prefers-color-scheme:dark){.ca-mark,.ca-arrow{--ca-stroke:color-mix(in srgb,var(--ca-solid,var(--ca-color)) calc(65% + 35% * var(--ca-on,0)),#fff)}}",
  ".ca-mark svg{position:absolute;left:-5px;top:-5px;width:calc(100% + 10px);height:calc(100% + 10px);overflow:visible;fill:none;stroke:currentColor;stroke:var(--ca-stroke,currentColor);stroke-width:calc(1.5px + .5px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .15s ease}",
  ".ca-highlight svg{left:0;top:0;width:100%;height:100%;fill:currentColor;fill-opacity:calc(.14 + .08 * var(--ca-on,0));stroke:none}",
  ".ca-underline svg{top:calc(100% - 5px);height:12px}",
  // A tick beside the target, so it doesn't hide what it approves.
  ".ca-check svg{left:calc(100% + 4px);top:50%;width:20px;height:20px;transform:translateY(-50%)}",
  ".ca-stamp{display:inline-grid;place-items:center;flex:none;min-width:15px;height:15px;padding:0 4px;box-sizing:border-box;border-radius:999px;background:var(--ca-solid,var(--ca-color));color:var(--ca-ink);font-family:var(--_comark-font);font-size:9.5px;font-weight:600;line-height:1;letter-spacing:-.01em;font-variant-numeric:tabular-nums}",
  ".ca-letter{display:none}",
  ".ca-mark .ca-stamp{position:absolute;right:calc(100% + 4px);bottom:calc(100% + 4px);box-shadow:0 0 0 2px var(--ca-ring,var(--_comark-background)),0 1px 3px rgb(0 0 0/.18);transform:scale(calc(1 + .1 * var(--ca-on,0)));transition:transform .15s ease}",
  ".ca-at-left .ca-stamp{right:auto;left:-4px}",
  ".ca-at-top .ca-stamp{bottom:auto;top:-4px}",
  ".ca-at-left.ca-at-top .ca-stamp{left:3px;top:3px}",
  // A numbered mark that draws nothing is only its number, so the number stays on the corner.
  ".ca-mark.ca-none .ca-stamp{right:auto;bottom:auto;left:-7.5px;top:-7.5px}",
  ".ca-arrow{position:absolute;height:16px;color:var(--ca-color);transform:translateY(-50%);pointer-events:none}",
  ".ca-arrow svg{position:absolute;overflow:visible;fill:none;stroke:currentColor;stroke:var(--ca-stroke,currentColor);stroke-width:calc(1.5px + .5px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round}",
  ".ca-arrow-line{inset:0;width:100%;height:100%}",
  ".ca-arrow-head{top:4.5px;width:7px;height:7px}",
  ".ca-arrow-right .ca-arrow-head{left:1px}",
  ".ca-arrow-left .ca-arrow-head{right:1px;transform:scaleX(-1)}",
  ".ca-arrow-top{width:24px;height:auto;transform:translateX(-50%)}",
  ".ca-arrow-top .ca-arrow-head{top:auto;bottom:1px;left:8.5px}",
  ".ca-callout{position:absolute;width:calc(var(--ca-gutter) - var(--ca-gap));padding:.25rem .5rem;box-sizing:border-box;border-radius:calc(var(--_comark-radius) - 4px);color:var(--ca-color);font-family:var(--ca-note-font);font-size:var(--ca-note-size);line-height:1.35;text-wrap:balance;transform:translateY(-50%);background:color-mix(in srgb,var(--ca-color) calc(8% * var(--ca-on,0)),transparent);transition:background .15s ease}",
  ".ca-callout-right{right:0}",
  ".ca-callout-left{left:0;text-align:right}",
  ".ca-callout-top{bottom:calc(100% - var(--ca-top-gutter) + var(--ca-gap));width:max-content;max-width:14rem;text-align:center;transform:translateX(-50%)}",
  ".ca-callout>div>:first-child{margin-top:0}",
  ".ca-callout>div>:last-child{margin-bottom:0}",
  // Too narrow for side notes: stack them under the image, drop the arrows, and letter each note and its target instead. Notes on both sides need more room than notes on one.
  "@container (max-width:28rem){.ca-stage{padding:0!important}.ca-arrow{display:none}.ca-callout{position:static;display:flex;gap:.6rem;align-items:baseline;width:auto;max-width:none;margin-top:.5rem;padding-left:0;text-align:left;transform:none}.ca-letter{display:inline-grid}.ca-none{outline:1.5px dashed var(--ca-color);outline-offset:3px;border-radius:3px}}",
  "@container (max-width:40rem){.ca-left.ca-right .ca-stage{padding:0!important}.ca-left.ca-right .ca-arrow{display:none}.ca-left.ca-right .ca-callout{position:static;display:flex;gap:.6rem;align-items:baseline;width:auto;max-width:none;margin-top:.5rem;padding-left:0;text-align:left;transform:none}.ca-left.ca-right .ca-letter{display:inline-grid}.ca-left.ca-right .ca-none{outline:1.5px dashed var(--ca-color);outline-offset:3px;border-radius:3px}}",
  // Host pages often center a figcaption, which suits a one-line caption but not a list of notes.
  ".ca figcaption{margin-top:.75rem;text-align:start}",
  // One line, so the two images of a compare stay level.
  ".ca-heading{display:flex;gap:.5rem;align-items:center;min-width:0;height:1.5em;margin-bottom:.5rem;text-align:start}",
  ".ca-label{flex:none;font-family:var(--ca-note-font);font-size:var(--ca-label-size);font-weight:500;line-height:1}",
  ".ca-heading a{font-size:.75em;opacity:.6}",
  ".ca-notes{list-style:none;margin:.5rem 0 0;padding:0;display:grid;gap:.125rem}",
  // `>` so a list written inside a note keeps its own bullets and spacing.
  ".ca-notes>li{display:flex;gap:.625rem;align-items:baseline;margin:0;padding:.3rem .5rem;border-radius:calc(var(--_comark-radius) - 4px);scroll-margin:1rem;background:color-mix(in srgb,var(--ca-color) calc(8% * var(--ca-on,0)),transparent);transition:background .15s ease}",
  ".ca-notes>li>div>:first-child{margin-top:0}",
  ".ca-notes>li>div>:last-child{margin-bottom:0}",
  // A diff reads like a suggested change in a GitHub review, framed like shadcn/ui's Card: the file and its counts in a
  // quiet header, removed lines red, added lines green, and the words that changed within a pair of lines a shade
  // deeper. Tints are translucent and text colors are mixed with the foreground, so wherever the `--comark-*` tokens
  // turn dark, a `.dark` class included, the diff turns with them.
  ".ca-diff{overflow:hidden;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:0 1px 2px rgb(0 0 0/.05)}",
  // On a narrow page the file drops under the label and wraps, rather than lose the end of its name.
  ".ca-diff>figcaption{display:flex;flex-wrap:wrap;gap:.125rem .5rem;align-items:flex-start;margin:0;padding:.5rem .75rem;border-bottom:1px solid var(--_comark-border);background:color-mix(in srgb,var(--_comark-accent) 50%,var(--_comark-background));font:.8125rem/1.25rem var(--_comark-font)}",
  ".ca-diff-icon{flex:none;width:1rem;height:1rem;margin:.125rem 0;color:var(--_comark-muted);fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
  ".ca-diff-label{font-weight:500}",
  ".ca-file,.ca-counts{font:.75rem/1.25rem var(--ca-code-font,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)}",
  ".ca-file{flex:1 1 12rem;min-width:0;color:var(--_comark-muted);overflow-wrap:anywhere}",
  ".ca-counts{display:flex;flex:none;gap:.375rem;margin-left:auto;font-weight:500;font-variant-numeric:tabular-nums}",
  // As much of each color as keeps 4.5:1 on the header, light or dark, whichever of its two shades the system picked.
  ".ca-added,.ca-add .ca-line::before{color:color-mix(in oklab,var(--ca-green) 60%,var(--_comark-foreground))}",
  ".ca-removed,.ca-del .ca-line::before{color:color-mix(in oklab,var(--ca-red) 70%,var(--_comark-foreground))}",
  // A long line scrolls instead of wrapping, so it stays beside its number.
  ".ca-scroll{overflow-x:auto;padding:.25rem 0;scrollbar-width:thin}",
  ".ca-scroll:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:-2px}",
  ".ca-code{width:100%;margin:0;border:0;border-collapse:collapse;background:none;font:.8125rem/1.375rem var(--ca-code-font,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);tab-size:2}",
  ".ca-code td{padding:0;border:0;vertical-align:top}",
  ".ca-code .ca-num{width:1%;padding:0 .375rem 0 .75rem;color:var(--_comark-muted);text-align:right;white-space:nowrap;-webkit-user-select:none;user-select:none}",
  ".ca-num::before{content:attr(data-line)}",
  ".ca-code .ca-line{padding-right:1rem;white-space:pre}",
  // The marker also gives an empty line its height.
  ".ca-line::before{content:' ';display:inline-block;width:1.75em;text-align:center;-webkit-user-select:none;user-select:none}",
  ".ca-del .ca-line::before{content:'−'}",
  ".ca-add .ca-line::before{content:'+'}",
  ".ca-del{background:color-mix(in srgb,var(--ca-red) 10%,transparent)}",
  ".ca-add{background:color-mix(in srgb,var(--ca-green) 12%,transparent)}",
  // The numbers of a changed line sit a shade deeper, as on GitHub.
  ".ca-del .ca-num{background:color-mix(in srgb,var(--ca-red) 8%,transparent)}",
  ".ca-add .ca-num{background:color-mix(in srgb,var(--ca-green) 8%,transparent)}",
  ".ca-code :is(del,ins){color:inherit;text-decoration:none}",
  ".ca-code del{background:color-mix(in srgb,var(--ca-red) 30%,transparent)}",
  ".ca-code ins{background:color-mix(in srgb,var(--ca-green) 30%,transparent)}",
  // A highlighted line keeps its row's color under a neutral wash, with a bar on its edge.
  ".ca-code [data-highlight]{background-image:linear-gradient(color-mix(in srgb,var(--_comark-foreground) 6%,transparent) 0 0)}",
  ".ca-code [data-highlight]>:first-child{box-shadow:inset 2px 0 var(--_comark-ring)}",
  ...linked,
].join("")}}`;

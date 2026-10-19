// Hovering, focusing, or linking to a mark or its note sets `--ca-on` on both, so each lights up the other without a script.
const linked = Array.from(
  { length: 40 },
  (_, index) =>
    `.ca:has([data-n="${index + 1}"]:is(:hover,:focus-visible,:target)) [data-n="${index + 1}"]{--ca-on:1}`,
);

export const css = [
  // One meaning per color: blue points something out (the default), red flags a problem, amber a warning, green a fix, gray anything neutral.
  // Strokes, arrows, and notes use the color, which lightens in dark mode. Stamps use a deeper solid shade in both themes,
  // so their number stays white (4.7:1 or better); only amber keeps a dark number.
  // :where() keeps these at zero specificity, so a host's plain `.ca { --ca-color: … }` wins.
  ":where(.ca,.ca-screenshot){--ca-red:#f43f5e;--ca-amber:#f5a524;--ca-green:#2f9e6b;--ca-blue:#5b6cf0;--ca-gray:#71717a;--ca-red-solid:#e11d48;--ca-amber-solid:#f59e0b;--ca-green-solid:#15803d;--ca-blue-solid:#4f46e5;--ca-gray-solid:#52525b;--ca-red-ink:#fff;--ca-amber-ink:#1c1917;--ca-green-ink:#fff;--ca-blue-ink:#fff;--ca-gray-ink:#fff;--ca-color:var(--ca-blue);--ca-solid:var(--ca-blue-solid);--ca-ink:var(--ca-blue-ink)}",
  // The figure carries the colors too, so a zoomed screenshot keeps them outside `.ca`.
  ":where(.ca){margin:1.5rem 0}",
  "@media (prefers-color-scheme:dark){:where(.ca,.ca-screenshot){--ca-red:#fb7185;--ca-amber:#ffb224;--ca-green:#56d39a;--ca-blue:#a5b4fc;--ca-gray:#a1a1aa}.ca-frame img{outline-color:rgb(255 255 255/.1)}}",
  ".ca-compare .cc{margin:0;--cc-gap:1.5rem}",
  ".ca-screenshot{--ca-gutter:10rem;--ca-top-gutter:5rem;--ca-gap:1.25rem;margin:0;container-type:inline-size}",
  ".ca-stage{position:relative}",
  ".ca-right .ca-stage{--ca-pr:var(--ca-gutter);padding-right:var(--ca-gutter)}",
  ".ca-left .ca-stage{--ca-pl:var(--ca-gutter);padding-left:var(--ca-gutter)}",
  ".ca-top .ca-stage{padding-top:var(--ca-top-gutter)}",
  ".ca-frame{position:relative;line-height:0}",
  ".ca-frame img{display:block;width:100%;height:auto;margin:0;border-radius:6px;outline:1px solid rgb(0 0 0/.1);outline-offset:-1px}",
  ".ca-mark{position:absolute;color:var(--ca-color);text-decoration:none;outline:none}",
  ".ca-mark svg{position:absolute;left:-5px;top:-5px;width:calc(100% + 10px);height:calc(100% + 10px);overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(2.75px + .75px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .15s ease}",
  ".ca-highlight svg{left:0;top:0;width:100%;height:100%;fill:currentColor;fill-opacity:calc(.14 + .08 * var(--ca-on,0));stroke:none}",
  ".ca-underline svg{top:calc(100% - 5px);height:12px}",
  // A tick beside the target, so it doesn't hide what it approves.
  ".ca-check svg{left:calc(100% + 4px);top:50%;width:20px;height:20px;transform:translateY(-50%)}",
  ".ca-stamp{display:inline-grid;place-items:center;flex:none;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:var(--ca-solid,var(--ca-color));color:var(--ca-ink);font-family:inherit;font-size:11px;font-weight:600;line-height:1;letter-spacing:-.01em;font-variant-numeric:tabular-nums}",
  ".ca-letter{display:none}",
  ".ca-mark .ca-stamp{position:absolute;left:-9px;top:-9px;box-shadow:0 0 0 2px var(--ca-ring,#fff),0 1px 3px rgb(0 0 0/.18);transform:scale(calc(1 + .1 * var(--ca-on,0)));transition:transform .15s ease}",
  ".ca-arrow{position:absolute;height:16px;color:var(--ca-color);transform:translateY(-50%);pointer-events:none}",
  ".ca-arrow svg{position:absolute;overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(2px + .5px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round}",
  ".ca-arrow-line{inset:0;width:100%;height:100%}",
  ".ca-arrow-head{top:4.5px;width:7px;height:7px}",
  ".ca-arrow-right .ca-arrow-head{left:1px}",
  ".ca-arrow-left .ca-arrow-head{right:1px;transform:scaleX(-1)}",
  ".ca-arrow-top{width:24px;height:auto;transform:translateX(-50%)}",
  ".ca-arrow-top .ca-arrow-head{top:auto;bottom:1px;left:8.5px}",
  ".ca-callout{position:absolute;width:calc(var(--ca-gutter) - var(--ca-gap));padding:.25rem .5rem;box-sizing:border-box;border-radius:6px;color:var(--ca-color);font-family:var(--ca-note-font,inherit);font-size:var(--ca-note-size,.8125em);line-height:1.35;transform:translateY(-50%);background:color-mix(in srgb,var(--ca-color) calc(8% * var(--ca-on,0)),transparent);transition:background .15s ease}",
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
  // One line, so the two images of a compare stay level even when only one side has a long URL.
  ".ca-heading{display:flex;gap:.5rem;align-items:center;min-width:0;height:1.5em;margin-bottom:.5rem;text-align:start}",
  ".ca-label{flex:none;font-family:var(--ca-note-font,inherit);font-size:var(--ca-label-size,.8125em);font-weight:500}",
  ".ca-heading a{min-width:0;overflow:hidden;font:.75em/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;text-overflow:ellipsis;opacity:.6}",
  ".ca-notes{list-style:none;margin:.5rem 0 0;padding:0;display:grid;gap:.125rem}",
  ".ca-notes li{display:flex;gap:.625rem;align-items:baseline;margin:0;padding:.3rem .5rem;border-radius:6px;scroll-margin:1rem;background:color-mix(in srgb,var(--ca-color) calc(8% * var(--ca-on,0)),transparent);transition:background .15s ease}",
  ".ca-notes li>div>:first-child{margin-top:0}",
  ".ca-notes li>div>:last-child{margin-bottom:0}",
  ...linked,
].join("");

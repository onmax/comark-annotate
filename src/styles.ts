// Hovering, focusing, or linking to a mark or its note sets `--ca-on` on both, so each lights up the other without a script.
const linked = Array.from(
  { length: 40 },
  (_, index) =>
    `.ca:has([data-n="${index + 1}"]:is(:hover,:focus-visible,:target)) [data-n="${index + 1}"]{--ca-on:1}`,
);

export const css = [
  ".ca{--ca-color:#e0453d;margin:1.5rem 0}",
  ".ca-compare{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));align-items:start}",
  ".ca-screenshot{--ca-gutter:10rem;--ca-gap:1.25rem;margin:0;container-type:inline-size}",
  ".ca-right .ca-frame{margin-right:var(--ca-gutter)}",
  ".ca-left .ca-frame{margin-left:var(--ca-gutter)}",
  ".ca-frame{position:relative;line-height:0}",
  ".ca-frame img{display:block;width:100%;height:auto;margin:0;border-radius:6px;box-shadow:0 0 0 1px rgb(127 127 127/.25)}",
  ".ca-mark{position:absolute;color:var(--ca-color);text-decoration:none}",
  ".ca-mark svg{position:absolute;left:-6px;top:-6px;width:calc(100% + 12px);height:calc(100% + 12px);overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(3px + 2px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round}",
  ".ca-highlight svg{left:0;top:0;width:100%;height:100%;fill:currentColor;fill-opacity:calc(.22 + .1 * var(--ca-on,0));stroke:none}",
  ".ca-underline svg{top:calc(100% - 6px);height:16px}",
  // A tick beside the target, so it doesn't hide what it approves.
  ".ca-check svg{left:calc(100% + 2px);top:50%;width:26px;height:26px;transform:translateY(-50%)}",
  ".ca-stamp{display:inline-grid;place-items:center;flex:none;min-width:1.5em;height:1.5em;padding:0 .35em;box-sizing:border-box;border-radius:999px;background:var(--ca-color);color:#fff;font-family:inherit;font-size:12px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}",
  ".ca-mark .ca-stamp{position:absolute;left:-.9em;top:-.9em;box-shadow:0 0 0 2px #fff;transform:scale(calc(1 + .2 * var(--ca-on,0)))}",
  ".ca-arrow{position:absolute;height:20px;color:var(--ca-color);transform:translateY(-50%);pointer-events:none}",
  ".ca-arrow svg{position:absolute;overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(2px + 1px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round}",
  ".ca-arrow-line{inset:0;width:100%;height:100%}",
  ".ca-arrow-head{top:4px;width:12px;height:12px}",
  ".ca-arrow-right .ca-arrow-head{left:2px}",
  ".ca-arrow-left .ca-arrow-head{right:2px;transform:scaleX(-1)}",
  ".ca-callout{position:absolute;display:flex;gap:.5rem;align-items:baseline;width:calc(var(--ca-gutter) - var(--ca-gap));padding:.35rem .5rem;box-sizing:border-box;border-radius:6px;font-size:.8125em;line-height:1.45;transform:translateY(-50%);background:color-mix(in srgb,var(--ca-color) calc(14% * var(--ca-on,0)),transparent)}",
  ".ca-callout-right{left:calc(100% + var(--ca-gap))}",
  ".ca-callout-left{right:calc(100% + var(--ca-gap))}",
  ".ca-callout>div>:first-child{margin-top:0}",
  ".ca-callout>div>:last-child{margin-bottom:0}",
  // Too narrow for side notes: stack them under the image and drop the arrows.
  "@container (max-width:36rem){.ca-frame{margin:0!important}.ca-arrow{display:none}.ca-callout{position:static;width:auto;margin-top:.5rem;transform:none}}",
  ".ca figcaption{margin-top:.75rem}",
  ".ca-heading{display:flex;flex-wrap:wrap;gap:.5rem;align-items:baseline;margin-bottom:.5rem}",
  ".ca-label{font-weight:600}",
  ".ca-heading a{font-size:.875em;opacity:.75;word-break:break-all}",
  ".ca-notes{list-style:none;margin:.5rem 0 0;padding:0;display:grid;gap:.25rem}",
  ".ca-notes li{display:flex;gap:.6rem;align-items:baseline;margin:0;padding:.35rem .5rem;border-radius:6px;scroll-margin:1rem;background:color-mix(in srgb,var(--ca-color) calc(14% * var(--ca-on,0)),transparent)}",
  ".ca-notes li>div>:first-child{margin-top:0}",
  ".ca-notes li>div>:last-child{margin-bottom:0}",
  ...linked,
].join("");

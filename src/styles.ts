// Hovering, focusing, or linking to a mark or its note sets `--ca-on` on both, so each lights up the other without a script.
const linked = Array.from(
  { length: 40 },
  (_, index) =>
    `.ca:has([data-n="${index + 1}"]:is(:hover,:focus-visible,:target)) [data-n="${index + 1}"]{--ca-on:1}`,
);

export const css = [
  // One meaning per color: red flags a problem, amber a warning, green a fix, blue information, gray anything neutral.
  // Each color has an ink for the number on its stamp: white on the darker light-mode fills, near-black on amber and on every bright dark-mode fill.
  ".ca{--ca-red:#e5484d;--ca-amber:#f5a524;--ca-green:#2f8a5b;--ca-blue:#0070f3;--ca-gray:#6f6f6f;--ca-red-ink:#fff;--ca-amber-ink:#1c1917;--ca-green-ink:#fff;--ca-blue-ink:#fff;--ca-gray-ink:#fff;--ca-color:var(--ca-red);--ca-ink:var(--ca-red-ink);margin:1.5rem 0}",
  "@media (prefers-color-scheme:dark){.ca{--ca-red:#ff6369;--ca-amber:#ffb224;--ca-green:#3dd68c;--ca-blue:#52a8ff;--ca-gray:#a1a1a1;--ca-red-ink:#0a0a0a;--ca-amber-ink:#0a0a0a;--ca-green-ink:#0a0a0a;--ca-blue-ink:#0a0a0a;--ca-gray-ink:#0a0a0a}.ca-frame img{outline-color:rgb(255 255 255/.1)}}",
  ".ca-compare{display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));align-items:start}",
  ".ca-screenshot{--ca-gutter:10rem;--ca-gap:1.25rem;margin:0;container-type:inline-size}",
  ".ca-stage{position:relative}",
  ".ca-right .ca-stage{padding-right:var(--ca-gutter)}",
  ".ca-left .ca-stage{padding-left:var(--ca-gutter)}",
  ".ca-frame{position:relative;line-height:0}",
  ".ca-frame img{display:block;width:100%;height:auto;margin:0;border-radius:6px;outline:1px solid rgb(0 0 0/.1);outline-offset:-1px}",
  ".ca-mark{position:absolute;color:var(--ca-color);text-decoration:none;outline:none}",
  ".ca-mark svg{position:absolute;left:-5px;top:-5px;width:calc(100% + 10px);height:calc(100% + 10px);overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(2px + 1px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .15s}",
  ".ca-highlight svg{left:0;top:0;width:100%;height:100%;fill:currentColor;fill-opacity:calc(.16 + .08 * var(--ca-on,0));stroke:none}",
  ".ca-underline svg{top:calc(100% - 5px);height:12px}",
  // A tick beside the target, so it doesn't hide what it approves.
  ".ca-check svg{left:calc(100% + 4px);top:50%;width:20px;height:20px;transform:translateY(-50%)}",
  ".ca-stamp{display:inline-grid;place-items:center;flex:none;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:var(--ca-color);color:var(--ca-ink);font-family:inherit;font-size:11px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}",
  ".ca-mark .ca-stamp{position:absolute;left:-9px;top:-9px;box-shadow:0 0 0 1.5px var(--ca-ring,#fff);transform:scale(calc(1 + .15 * var(--ca-on,0)));transition:transform .15s}",
  ".ca-arrow{position:absolute;height:16px;color:var(--ca-color);transform:translateY(-50%);pointer-events:none}",
  ".ca-arrow svg{position:absolute;overflow:visible;fill:none;stroke:currentColor;stroke-width:calc(1.5px + .5px * var(--ca-on,0));stroke-linecap:round;stroke-linejoin:round}",
  ".ca-arrow-line{inset:0;width:100%;height:100%}",
  ".ca-arrow-head{top:4px;width:8px;height:8px}",
  ".ca-arrow-right .ca-arrow-head{left:1px}",
  ".ca-arrow-left .ca-arrow-head{right:1px;transform:scaleX(-1)}",
  ".ca-callout{position:absolute;width:calc(var(--ca-gutter) - var(--ca-gap));padding:.25rem .5rem;box-sizing:border-box;border-radius:6px;font-size:.8125em;line-height:1.45;transform:translateY(-50%);background:color-mix(in srgb,var(--ca-color) calc(10% * var(--ca-on,0)),transparent);transition:background .15s}",
  ".ca-callout-right{right:0}",
  ".ca-callout-left{left:0;text-align:right}",
  ".ca-callout>div>:first-child{margin-top:0}",
  ".ca-callout>div>:last-child{margin-bottom:0}",
  // Too narrow for side notes: stack them under the image, marked by their color, and drop the arrows. Notes on both sides need more room than notes on one.
  "@container (max-width:28rem){.ca-stage{padding:0!important}.ca-arrow{display:none}.ca-callout{position:static;width:auto;margin-top:.5rem;padding-left:.75rem;border-left:2px solid var(--ca-color);border-radius:0;text-align:left;transform:none}}",
  "@container (max-width:40rem){.ca-left.ca-right .ca-stage{padding:0!important}.ca-left.ca-right .ca-arrow{display:none}.ca-left.ca-right .ca-callout{position:static;width:auto;margin-top:.5rem;padding-left:.75rem;border-left:2px solid var(--ca-color);border-radius:0;text-align:left;transform:none}}",
  ".ca figcaption{margin-top:.75rem}",
  ".ca-heading{display:flex;flex-wrap:wrap;gap:.5rem;align-items:baseline;margin-bottom:.5rem}",
  ".ca-label{font-weight:600}",
  ".ca-heading a{font-size:.875em;opacity:.75;word-break:break-all}",
  ".ca-notes{list-style:none;margin:.5rem 0 0;padding:0;display:grid;gap:.125rem}",
  ".ca-notes li{display:flex;gap:.625rem;align-items:baseline;margin:0;padding:.3rem .5rem;border-radius:6px;scroll-margin:1rem;background:color-mix(in srgb,var(--ca-color) calc(10% * var(--ca-on,0)),transparent);transition:background .15s}",
  ".ca-notes li>div>:first-child{margin-top:0}",
  ".ca-notes li>div>:last-child{margin-bottom:0}",
  ...linked,
].join("");

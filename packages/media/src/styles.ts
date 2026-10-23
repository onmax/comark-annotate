import { theme } from "comark-zoom/theme";

const track =
  "height:.375rem;border-radius:999px;background:linear-gradient(var(--_cm-fill),var(--_cm-primary) var(--cm-at,0%),var(--_comark-accent) var(--cm-at,0%))";
const thumb =
  "box-sizing:border-box;width:1rem;height:1rem;border:1px solid var(--_cm-primary);border-radius:50%;background:var(--_comark-background);box-shadow:0 1px 2px rgb(0 0 0/.1)";
const ring = "box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)";

/**
 * Videos the page's width at most, in a frame on the shared `--comark-*` tokens, and audio players the page's width.
 * The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cm"),
  ":where(.cm){--_cm-primary:var(--ui-primary,var(--primary,var(--_comark-foreground)));--_cm-on-primary:var(--primary-foreground,var(--_comark-background))}",
  ".cm{display:block;box-sizing:border-box;max-width:100%;margin:1rem 0}",
  // The accent tint shows where the video will be before its first frame loads.
  "video.cm{height:auto;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-accent)}",
  "audio.cm,.cm-audio>audio{display:block;width:100%}",
  // The browser's player shows until the script reaches the player, and again if the file can't play, so it can say why.
  ".cm-bar{display:none}",
  ".cm-audio[data-media-ready]:not([data-error])>audio{display:none}",
  ".cm-audio[data-media-ready]:not([data-error])>.cm-bar{display:flex}",
  ".cm-bar{align-items:center;gap:.75rem;box-sizing:border-box;padding:.5rem .75rem .5rem .5rem;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-foreground);font:.875rem/1.25rem var(--_comark-font)}",
  ".cm-bar button{display:inline-grid;place-items:center;flex:none;width:2rem;height:2rem;margin:0;padding:0;border:0;cursor:pointer;touch-action:manipulation;transition:background .15s,opacity .15s}",
  `.cm-bar button:focus-visible{outline:none;${ring}}`,
  ".cm-bar svg{width:1rem;height:1rem}",
  ".cm-play{border-radius:999px;background:var(--_cm-primary);color:var(--_cm-on-primary)}",
  ".cm-play:hover{opacity:.9}",
  // A triangle looks off-center when its box is centered.
  ".cm-play .cm-icon-play{translate:1px 0}",
  ".cm-mute{border-radius:calc(var(--_comark-radius) - 2px);background:none;color:var(--_comark-muted)}",
  ".cm-mute:hover{background:var(--_comark-accent);color:var(--_comark-foreground)}",
  ".cm-icon-pause,.cm-icon-muted,[data-playing] .cm-icon-play,[data-muted] .cm-icon-volume{display:none}",
  "[data-playing] .cm-icon-pause,[data-muted] .cm-icon-muted{display:block}",
  ".cm-time{flex:none;color:var(--_comark-muted);font-variant-numeric:tabular-nums}",
  ".cm-seek{--_cm-fill:to right;flex:1;min-width:0;height:1rem;margin:0;background:none;appearance:none;cursor:pointer}",
  ".cm-seek:dir(rtl){--_cm-fill:to left}",
  ".cm-seek:disabled{opacity:.5;cursor:default}",
  ".cm-seek:focus-visible{outline:none}",
  // Each engine drops a whole rule over a pseudo-element it doesn't know, so every one gets its own.
  `.cm-seek::-webkit-slider-runnable-track{${track}}`,
  `.cm-seek::-moz-range-track{${track}}`,
  `.cm-seek::-webkit-slider-thumb{${thumb};margin-top:-.3125rem;appearance:none}`,
  `.cm-seek::-moz-range-thumb{${thumb}}`,
  `.cm-seek:focus-visible::-webkit-slider-thumb{${ring}}`,
  `.cm-seek:focus-visible::-moz-range-thumb{${ring}}`,
  "@media (pointer:coarse){.cm-bar button{width:2.5rem;height:2.5rem}}",
].join("")}}`;

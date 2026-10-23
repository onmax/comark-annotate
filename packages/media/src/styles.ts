import { theme } from "comark-zoom/theme";

/**
 * Videos the page's width at most, in a frame on the shared `--comark-*` tokens, and audio players the page's width.
 * The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cm"),
  ".cm{display:block;box-sizing:border-box;max-width:100%;margin:1rem 0}",
  // The accent tint shows where the video will be before its first frame loads.
  "video.cm{height:auto;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-accent)}",
  "audio.cm{width:100%}",
].join("")}}`;

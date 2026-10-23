import { theme } from "comark-zoom/theme";

/**
 * Videos the page's width at most, in a frame on the shared `--comark-*` tokens, and audio players the page's width.
 * The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cm"),
  ".cm{display:block;box-sizing:border-box;max-width:100%;margin:1rem 0}",
  // Black, as players letterbox, so a video narrower than its frame doesn't sit on a white band before it loads.
  "video.cm{height:auto;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:#000}",
  "audio.cm{width:100%}",
].join("")}}`;

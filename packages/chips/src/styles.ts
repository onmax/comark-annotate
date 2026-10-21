import { theme } from "comark-zoom/theme";

/**
 * Chips in the style of shadcn/ui's Badge: a rounded outline on the shared `--comark-*` tokens, with the image at the
 * text's size, square for a favicon and round for an avatar. The rules sit in the `comark` layer, so any unlayered
 * rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cch"),
  ".cch{padding:.0625em .5em .0625em .3125em;border:1px solid var(--_comark-border);border-radius:999px;background:var(--_comark-accent);color:inherit;text-decoration:none;white-space:nowrap;-webkit-box-decoration-break:clone;box-decoration-break:clone}",
  ".cch:hover{border-color:var(--_comark-ring)}",
  ".cch:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:2px}",
  ".cch-img{display:inline-block;width:1.125em;height:1.125em;margin-right:.3125em;border-radius:.25em;vertical-align:-.1875em;object-fit:cover}",
  '.cch[data-kind="avatar"] .cch-img{border-radius:50%}',
].join("")}}`;

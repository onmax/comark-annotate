import { theme } from "comark-zoom/theme";

/**
 * A chip is a tint of the text color with a hairline inset ring, so it reads on any surface without a border that
 * would add to its box. It stays inside the line's height: the image is the text's size, square with rounded corners
 * for a favicon and round in a pill for an avatar. Every value a site would change is a `--cp-*` variable. The rules
 * sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cp"),
  ":where(.cp){--_cp-tint:var(--cp-background,color-mix(in oklab,var(--_comark-foreground) 6%,transparent));--_cp-hover:var(--cp-hover,color-mix(in oklab,var(--_comark-foreground) 11%,transparent));--_cp-ring:var(--cp-ring,color-mix(in oklab,var(--_comark-foreground) 12%,transparent))}",
  ".cp{padding:.0625em .375em .0625em .1875em;border-radius:var(--cp-radius,.375em);background:var(--_cp-tint);box-shadow:inset 0 0 0 1px var(--_cp-ring);color:var(--cp-color,currentColor);font-weight:var(--cp-font-weight,500);text-decoration:none;white-space:nowrap;-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-color .15s ease-out,box-shadow .15s ease-out}",
  ".cp:not(:has(.cp-img)){padding-left:.375em}",
  ".cp:hover{background:var(--_cp-hover)}",
  ".cp:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:2px}",
  ".cp-img{display:inline-block;width:min(var(--cp-image-size,1em),1em);height:min(var(--cp-image-size,1em),1em);margin-right:.3125em;border-radius:.1875em;outline:1px solid color-mix(in oklab,var(--_comark-foreground) 10%,transparent);outline-offset:-1px;vertical-align:middle;object-fit:cover}",
  '.cp[data-kind="avatar"]{padding-left:.125em;border-radius:var(--cp-radius,999px)}',
  '.cp[data-kind="avatar"] .cp-img{border-radius:50%}',
  "@media (prefers-reduced-motion:reduce){.cp{transition:none}}",
].join("")}}`;

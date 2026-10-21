/**
 * The icon styles. Each icon carries its image in `--ci` and, when it isn't square, its width over its height in
 * `--ci-ratio`. The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  ".ci{display:inline-block;flex:none;height:var(--comark-icon-size,1em);aspect-ratio:var(--ci-ratio,1);vertical-align:-.125em;background:var(--ci) center/contain no-repeat}",
  // Forced colors replace the background color a mask paints with, so the icon would turn the page's color and vanish.
  ".ci[data-mask]{background:currentColor;mask:var(--ci) center/contain no-repeat;forced-color-adjust:preserve-parent-color}",
].join("")}}`;

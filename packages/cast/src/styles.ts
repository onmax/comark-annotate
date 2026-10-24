import { theme } from "comark-zoom/theme";

// Tailwind's zinc, red, green, yellow, blue, purple, and cyan, in the order terminals number them, then their bright
// versions.
const palette = [
  "#27272a",
  "#ef4444",
  "#22c55e",
  "#eab308",
  "#3b82f6",
  "#a855f7",
  "#06b6d4",
  "#d4d4d8",
  "#71717a",
  "#f87171",
  "#4ade80",
  "#facc15",
  "#60a5fa",
  "#c084fc",
  "#22d3ee",
  "#fafafa",
];

/**
 * A recording's text on a dark terminal, whatever the page's scheme, since programs pick their colors for one. Override
 * `--cca-background`, `--cca-foreground`, and `--cca-0` to `--cca-15` to change the terminal's colors. The rules sit in
 * the `comark` layer, so any unlayered rule of the host's wins, except the terminal's two colors: see below.
 */
export const css = `@layer comark{${[
  theme(".cca"),
  `:where(.cca){--cca-background:#09090b;--cca-foreground:#e4e4e7;${palette.map((color, n) => `--cca-${n}:${color}`).join(";")}}`,
  ".cca{margin:1.5rem 0;font-family:var(--_comark-font)}",
  ".cca figcaption{margin-bottom:.5rem;color:var(--_comark-muted);font-size:.875rem;line-height:1.25rem}",
  // Important inside a layer wins over a page's important `pre` background, which would put the program's colors on
  // the wrong ground. `--cca-background` is the way to change it.
  ".cca-term{padding:1rem;overflow-x:auto;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--cca-background)!important;color:var(--cca-foreground)!important;font:.8125rem/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;tab-size:8}",
  // A page's own `pre` margin, almost always unlayered, would push the terminal away from its caption, and only
  // `!important` beats it.
  ".cca-term{margin:0!important}",
  ...palette.map(
    (_, n) => `.cca-f${n}{color:var(--cca-${n})}.cca-b${n}{background:var(--cca-${n})}`,
  ),
  ".cca-fi{color:var(--cca-background)}.cca-bi{background:var(--cca-foreground)}",
  ".cca-bold{font-weight:700}.cca-dim{opacity:.6}.cca-italic{font-style:italic}",
  ".cca-underline{text-decoration:underline}.cca-strike{text-decoration:line-through}.cca-underline.cca-strike{text-decoration:underline line-through}",
  "@media print{.cca-term{-webkit-print-color-adjust:exact;print-color-adjust:exact;white-space:pre-wrap}}",
].join("")}}`;

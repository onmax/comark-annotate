import { theme } from "comark-zoom/theme";

const marks = ".ccm-ins,.ccm-del,.ccm-mark";

/**
 * Styles for the marks, on the shared `--comark-*` tokens: an insertion tinted green over a line, a deletion struck
 * through in red (shadcn/ui's `--destructive` when the page has it), a highlight in amber, and a comment as a muted chip
 * beside the text it's about. Override `--ccm-ins`, `--ccm-del`, and `--ccm-mark`. The rules sit in the `comark`
 * layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(`${marks},.ccm-comment`),
  `:where(${marks}){--ccm-ins:#259f56;--ccm-del:var(--destructive,#ee3533);--ccm-mark:#f5b400}`,
  `@media (prefers-color-scheme:dark){:where(${marks}){--ccm-ins:#59d38c;--ccm-del:var(--destructive,#fd736d);--ccm-mark:#f5c84b}}`,
  // A mark that wraps keeps its tint and corners on every line.
  `${marks},.ccm-comment{border-radius:calc(var(--_comark-radius) - 6px);-webkit-box-decoration-break:clone;box-decoration-break:clone}`,
  `${marks}{padding:0 .125em;color:inherit}`,
  // The line under an insertion says what the green does, for a reader who can't tell it from the text.
  ".ccm-ins{background:color-mix(in srgb,var(--ccm-ins) 14%,transparent);box-shadow:inset 0 -1.5px color-mix(in srgb,var(--ccm-ins) 60%,transparent);text-decoration:none}",
  ".ccm-del{background:color-mix(in srgb,var(--ccm-del) 10%,transparent);color:color-mix(in oklab,var(--ccm-del) 60%,var(--_comark-foreground));text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--ccm-del) 70%,transparent)}",
  ".ccm-mark{background:color-mix(in srgb,var(--ccm-mark) 30%,transparent)}",
  ".ccm-comment{margin:0 .125em;padding:.0625em .375em;background:var(--_comark-accent);box-shadow:inset 0 0 0 1px var(--_comark-border);color:var(--_comark-muted);font-size:.8125em;font-style:normal}",
].join("")}}`;

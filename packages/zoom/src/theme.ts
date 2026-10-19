// Each token, the shadcn/ui variable it falls back to, and shadcn's neutral theme for when neither is set.
const tokens = [
  ["background", "background", "#fff", "#0a0a0a"],
  ["foreground", "foreground", "#0a0a0a", "#fafafa"],
  ["muted", "muted-foreground", "#737373", "#a1a1a1"],
  ["border", "border", "#e5e5e5", "rgb(255 255 255/.1)"],
  ["accent", "accent", "#f5f5f5", "#262626"],
  ["ring", "ring", "#a1a1a1", "#737373"],
] as const;

const resolve = (scheme: 2 | 3) =>
  tokens
    .map(
      (token) =>
        `--_comark-${token[0]}:var(--comark-${token[0]},var(--${token[1]},${token[scheme]}))`,
    )
    .join(";");

/**
 * Resolves the `--comark-*` tokens on `selector`, falling back to shadcn/ui's variables and then to its neutral theme.
 * They resolve on the component rather than `:root`, so a `.dark` class anywhere above it switches the theme, and a
 * `--comark-*` set on any ancestor still inherits down. `:where()` keeps them at zero specificity.
 */
export function theme(selector: string): string {
  const where = `:where(${selector})`;
  return (
    `${where}{${resolve(2)};--_comark-radius:var(--comark-radius,var(--radius,.625rem));--_comark-font:var(--comark-font,var(--font-sans,ui-sans-serif,system-ui,sans-serif))}` +
    `@media (prefers-color-scheme:dark){${where}{${resolve(3)}}}`
  );
}

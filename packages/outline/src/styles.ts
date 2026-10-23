import { theme } from "comark-zoom/theme";

/**
 * A contents box in the style of shadcn/ui's Card, its title muted and its nested lists indented, on the shared
 * `--comark-*` tokens. The rules sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cto"),
  ".cto{margin:1.5rem 0;padding:1rem 1.25rem;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-foreground);font:400 .875rem/1.5rem var(--_comark-font)}",
  ".cto-title{margin:0 0 .5rem;color:var(--_comark-muted);font-size:.75rem;font-weight:500;letter-spacing:.04em;text-transform:uppercase}",
  ".cto ul{margin:0;padding:0;list-style:none}",
  ".cto ul ul{padding-inline-start:1rem}",
  ".cto li{margin:0}",
  ".cto a{color:inherit;text-decoration:none;text-underline-offset:4px}",
  ".cto a:hover{text-decoration:underline}",
  ".cto a:focus-visible{border-radius:calc(var(--_comark-radius)/4);outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".cto ul ul a{color:var(--_comark-muted)}",
  ".cto ul ul a:hover{color:var(--_comark-foreground)}",
  "@media print{.cto{break-inside:avoid}}",
].join("")}}`;

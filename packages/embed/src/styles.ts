import { theme } from "comark-zoom/theme";

/**
 * Players on a panel in the page's width, with the link under them, and link cards in the style of a shadcn/ui Card,
 * on the shared `--comark-*` tokens. Override `--ce-app-height` for CodePen, StackBlitz, and Figma. The rules sit in
 * the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".ce,.ce-card"),
  ":where(.ce){--ce-app-height:30rem}",
  ".ce{margin:1.5rem 0;font-family:var(--_comark-font)}",
  ".ce-frame{overflow:hidden;border-radius:var(--_comark-radius);background:color-mix(in srgb,var(--_comark-foreground) 4%,transparent)}",
  ".ce-frame iframe{display:block;width:100%;height:100%;border:0}",
  ".ce[data-size='video'] .ce-frame{aspect-ratio:16/9}",
  ".ce[data-size='short'] .ce-frame{aspect-ratio:9/16;max-width:20rem;margin-inline:auto}",
  // Spotify draws its own rounded card at these heights.
  ".ce[data-size='compact'] .ce-frame{height:152px;background:none}",
  ".ce[data-size='list'] .ce-frame{height:352px;background:none}",
  ".ce[data-size='app'] .ce-frame{height:var(--ce-app-height)}",
  ".ce figcaption{margin-top:.5rem;color:var(--_comark-muted);font-size:.875rem;line-height:1.25rem}",
  ".ce[data-size='short'] figcaption{text-align:center}",
  ".ce figcaption a{color:inherit;text-underline-offset:2px}",
  ".ce-card{display:flex;flex-direction:column;gap:.125rem;margin:1rem 0;padding:.75rem 1rem;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-foreground);font:400 .875rem/1.25rem var(--_comark-font);text-decoration:none;transition:background .15s}",
  ".ce-card:hover{background:var(--_comark-accent)}",
  ".ce-card:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--_comark-ring) 50%,transparent)}",
  ".ce-card strong{font-weight:500;overflow-wrap:anywhere}",
  ".ce-card span{color:var(--_comark-muted)}",
].join("")}}`;

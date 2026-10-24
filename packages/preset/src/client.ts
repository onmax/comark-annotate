import { theme } from "comark-zoom/theme";

// comark-charts' palette, so a Mermaid pie or xychart colors its series like a chart does.
const series = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#f43f5e",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

/**
 * comark-pele's diagrams on the shared `--comark-*` tokens, on a card like comark-diagrams'. Pele paints with its
 * `--pele-*` variables, so setting them on the wrapper themes every diagram, light and dark, without drawing it
 * again. The rules sit in the `comark` layer, so any unlayered rule of the host's wins, `--pele-*` ones included.
 */
export const mermaidCss = `@layer comark{${[
  theme(".pele-diagram"),
  `:where(.pele-diagram){--pele-bg:var(--_comark-background);--pele-fg:var(--_comark-foreground);--pele-muted:var(--_comark-muted);--pele-line:var(--_comark-muted);--pele-surface:var(--_comark-accent);--pele-surface-alt:color-mix(in srgb,var(--_comark-accent),var(--_comark-foreground) 6%);--pele-border:var(--_comark-ring);--pele-accent:var(--ui-primary,var(--primary,var(--_comark-foreground)));--pele-critical:var(--ui-error,var(--destructive,#dc2626));--pele-error:var(--ui-error,var(--destructive,#dc2626));--pele-font:var(--_comark-font);--pele-radius:calc(var(--_comark-radius) - 4px);${series.map((hex, index) => `--pele-series-${index + 1}:var(--comark-chart-${index + 1},var(--chart-${index + 1},${hex}))`).join(";")}}`,
  ".pele-diagram{margin:1.5rem 0;padding:1rem;overflow-x:auto;border:1px solid var(--_comark-border);border-radius:var(--_comark-radius);background:var(--_comark-background);color:var(--_comark-foreground);text-align:center}",
  ".pele-source{margin:0;color:var(--_comark-muted);text-align:left}",
  "@media print{.pele-diagram{break-inside:avoid}}",
].join("")}}`;

/** Adds the Mermaid styles to the page once. The Vue, React, and Svelte diagrams call it when Pele draws them. */
export function addMermaidStyles(): void {
  if (document.querySelector("style[data-comark-mermaid]")) return;
  const style = document.createElement("style");
  style.dataset.comarkMermaid = "";
  style.textContent = mermaidCss;
  document.head.append(style);
}

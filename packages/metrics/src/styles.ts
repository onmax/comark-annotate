import { theme } from "comark-zoom/theme";

/**
 * Deltas colored green when better and red when worse (shadcn/ui's `--destructive` when the page has it), a progress
 * bar in shadcn/ui's `--primary`, and a stats table with its numbers aligned, on the shared `--comark-*` tokens. Override
 * `--cmt-better`, `--cmt-worse`, and `--cmt-bar`. The rules sit in the `comark` layer, so
 * any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".cmt-delta,.cmt-progress,.cmt-stats"),
  ":where(.cmt-delta){--cmt-better:#259f56;--cmt-worse:var(--destructive,#ee3533)}",
  "@media (prefers-color-scheme:dark){:where(.cmt-delta){--cmt-better:#59d38c;--cmt-worse:var(--destructive,#fd736d)}}",
  // shadcn/ui's Progress: the primary color on a track of itself at a fifth.
  ":where(.cmt-progress){--cmt-bar:var(--primary,var(--_comark-foreground))}",
  ".cmt-delta{font-variant-numeric:tabular-nums;white-space:nowrap}",
  ".cmt-from{color:var(--_comark-muted)}",
  ".cmt-change{font-weight:500}",
  ".cmt-delta[data-verdict='better'] .cmt-change{color:var(--cmt-better)}",
  ".cmt-delta[data-verdict='worse'] .cmt-change{color:var(--cmt-worse)}",
  ".cmt-delta[data-verdict='neutral'] .cmt-change{color:var(--_comark-muted)}",
  ".cmt-progress{display:inline-flex;align-items:center;gap:.5rem;vertical-align:middle;font-variant-numeric:tabular-nums}",
  ".cmt-progress progress{appearance:none;width:8rem;height:.5rem;overflow:hidden;border:0;border-radius:999px;background:color-mix(in srgb,var(--cmt-bar) 20%,transparent);color:var(--cmt-bar)}",
  ".cmt-progress progress::-webkit-progress-bar{background:color-mix(in srgb,var(--cmt-bar) 20%,transparent)}",
  ".cmt-progress progress::-webkit-progress-value{border-radius:999px;background:var(--cmt-bar)}",
  ".cmt-progress progress::-moz-progress-bar{border-radius:999px;background:var(--cmt-bar)}",
  ".cmt-label,.cmt-percent{color:var(--_comark-muted);font-size:.875em}",
  ".cmt-stats :is(td,th):not(:first-child){text-align:end;font-variant-numeric:tabular-nums}",
].join("")}}`;

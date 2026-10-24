import { theme } from "comark-zoom/theme";

/**
 * A card with the counts on top, a green or red edge for whether every test passed (shadcn/ui's `--destructive` when
 * the page has it), and each failure as a disclosure with its stack, on the shared `--comark-*` tokens. Override `--ctr-pass`, `--ctr-fail`, and `--ctr-skip`. The rules
 * sit in the `comark` layer, so any unlayered rule of the host's wins.
 */
export const css = `@layer comark{${[
  theme(".ctr"),
  ":where(.ctr){--ctr-pass:#259f56;--ctr-fail:var(--destructive,#ee3533);--ctr-skip:var(--_comark-muted)}",
  "@media (prefers-color-scheme:dark){:where(.ctr){--ctr-pass:#59d38c;--ctr-fail:var(--destructive,#fd736d)}}",
  ".ctr{margin:1.5rem 0;border:1px solid var(--_comark-border);border-inline-start:3px solid var(--ctr-pass);border-radius:var(--_comark-radius);font-family:var(--_comark-font)}",
  ".ctr[data-status='failed']{border-inline-start-color:var(--ctr-fail)}",
  ".ctr-summary{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem 1rem;margin:0;padding:.75rem 1rem;font-size:.875rem;line-height:1.25rem;font-variant-numeric:tabular-nums}",
  ".ctr-title{margin-inline-end:auto;font-weight:600}",
  ".ctr-count{display:inline-flex;align-items:center;gap:.375rem}",
  ".ctr-count::before{content:'';width:.5rem;height:.5rem;border-radius:999px;background:var(--ctr-pass)}",
  ".ctr-count[data-kind='failed']::before{background:var(--ctr-fail)}",
  ".ctr-count[data-kind='skipped']::before{background:var(--ctr-skip)}",
  ".ctr-time{color:var(--_comark-muted)}",
  ".ctr-failure{border-top:1px solid var(--_comark-border)}",
  ".ctr-failure>summary{padding:.5rem 1rem;font-size:.875rem;font-weight:500;cursor:pointer;overflow-wrap:anywhere}",
  ".ctr-failure>summary:hover{background:var(--_comark-accent)}",
  ".ctr-failure>summary:focus-visible{outline:none;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--_comark-ring) 60%,transparent)}",
  ".ctr-message{margin:0;padding:0 1rem .5rem;color:var(--ctr-fail);font-size:.875rem;white-space:pre-wrap;overflow-wrap:anywhere}",
  ".ctr-stack{margin:0 1rem 1rem;overflow-x:auto;font-size:.8125rem}",
  "@media print{.ctr-failure:not([open])>:not(summary){display:block}}",
].join("")}}`;

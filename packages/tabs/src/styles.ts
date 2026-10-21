import { theme } from "comark-zoom/theme";

/**
 * The tab styles: a segmented control in the style of shadcn/ui, on the shared `--comark-*` tokens. The script adds
 * them to the page once. The rules sit in the `comark` layer, so any unlayered rule of the host's wins, except the one
 * after it that joins a code group's block to its header.
 */
export const css = `@layer comark{${[
  theme(".ct"),
  ".ct{margin:1.5rem 0}",
  // Without the script, every panel shows under a caption with its label, and the strip that couldn't switch them hides.
  ".ct-list{display:none;width:fit-content;max-width:100%;gap:2px;padding:2px;overflow-x:auto;scrollbar-width:none;border-radius:var(--_comark-radius)}",
  ".ct-list::-webkit-scrollbar{display:none}",
  ".ct-list,.ct[data-tabs-code]>.ct-panel>.ct-caption{background:color-mix(in srgb,var(--_comark-accent) 50%,transparent);box-shadow:inset 0 0 0 1px var(--_comark-border)}",
  "[data-tabs-ready] .ct-list{display:flex}",
  "[data-tabs-ready] .ct-caption,[data-tabs-ready] .ct-panel[data-inactive]{display:none}",
  ".ct-tab{display:inline-flex;flex:none;align-items:center;gap:.375rem;padding:.25rem .625rem;border:0;border-radius:calc(var(--_comark-radius) - 2px);background:none;color:var(--_comark-muted);font:500 .8125rem/1.25rem var(--_comark-font);white-space:nowrap;cursor:pointer;touch-action:manipulation;transition:color .15s,background-color .15s,box-shadow .15s}",
  ".ct-tab:hover{color:var(--_comark-foreground)}",
  // The open tab carries its own surface rather than a sliding indicator, so the server's markup already shows it and
  // nothing moves when the script starts. Forced colors drop the surface, and the transparent outline shows instead.
  ".ct-tab[aria-selected='true']{background:var(--_comark-background);color:var(--_comark-foreground);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--_comark-border),var(--_comark-foreground) 8%);outline:1px solid transparent;outline-offset:-1px}",
  ".ct-tab:focus-visible,.ct-panel:focus-visible{outline:2px solid var(--_comark-ring);outline-offset:1px}",
  // The strip scrolls, so it clips whatever reaches past its padding: a tab's ring stays inside the tab.
  ".ct-tab:focus-visible{outline-offset:-2px}",
  ".ct-panel{border-radius:var(--_comark-radius)}",
  "[data-tabs-ready] .ct-panel{margin-top:.75rem}",
  ".ct-caption{display:flex;align-items:center;gap:.375rem;margin:1.5rem 0 .5rem;color:var(--_comark-muted);font:500 .8125rem/1.25rem var(--_comark-font)}",
  ".ct-list+.ct-panel>.ct-caption{margin-top:0}",
  ".ct-caption+*{margin-top:0}",
  ".ct-panel>:last-child{margin-bottom:0}",
  // A code group is one card: the strip, or each caption without the script, is the header its code block hangs from.
  ".ct[data-tabs-code]>.ct-list{width:auto;padding:.375rem}",
  ".ct[data-tabs-code]>.ct-list,.ct[data-tabs-code]>.ct-panel>.ct-caption{border-radius:var(--_comark-radius) var(--_comark-radius) 0 0}",
  ".ct[data-tabs-code]>.ct-panel>.ct-caption{margin-bottom:-1px;padding:.625rem 1rem}",
  "[data-tabs-ready] .ct[data-tabs-code]>.ct-panel{margin-top:-1px}",
  ".ct[data-tabs-code]>.ct-panel{border-radius:0 0 var(--_comark-radius) var(--_comark-radius)}",
  "@media (pointer:coarse){.ct-tab{padding-block:.5rem}}",
].join("")}}${
  // The host styles its code blocks with plain rules, which beat any layered one. comark-code wraps each block in `.ck`.
  ".ct[data-tabs-code]>.ct-panel>pre,.ct[data-tabs-code]>.ct-panel>.ck>pre{margin:0;border-radius:0 0 var(--_comark-radius) var(--_comark-radius)}"
}`;

import { css } from "./styles.ts";

/** Adds the embed styles to the page once. The Vue, React, and Svelte components call it when they mount. */
export function addStyles(): void {
  if (document.querySelector("style[data-comark-embed]")) return;
  const style = document.createElement("style");
  style.dataset.comarkEmbed = "";
  style.textContent = css;
  document.head.append(style);
}

/** What every player may use. Each provider's own embed code asks for these. */
export const allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
// YouTube refuses to play without the page's origin, which `no-referrer` would withhold.
export const referrerPolicy = "strict-origin-when-cross-origin";

export { css };

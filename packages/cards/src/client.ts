import { css } from "./styles.ts";

/** Adds the card styles to the page once. The Vue, React, and Svelte components call it when they mount. */
export function addStyles(): void {
  if (document.querySelector("style[data-comark-cards]")) return;
  const style = document.createElement("style");
  style.dataset.comarkCards = "";
  style.textContent = css;
  document.head.append(style);
}

/** Lucide's arrow-up-right (ISC), drawn in the corner of a card that opens in a new tab. */
export const external = "M7 7h10v10M7 17 17 7";

/** The `rel` of a link that opens in a new tab, so the page it opens can't reach back into this one. */
export const rel = (target?: string): string | undefined =>
  target === "_blank" ? "noopener noreferrer" : undefined;

export { css };

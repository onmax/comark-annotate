import { css } from "./styles.ts";

/** Adds the callout styles to the page once. The Vue, React, and Svelte components call it when they mount. */
export function addStyles(): void {
  if (document.querySelector("style[data-comark-github]")) return;
  const style = document.createElement("style");
  style.dataset.comarkGithub = "";
  style.textContent = css;
  document.head.append(style);
}

export { css };
export { icon, typeOf } from "./icons.ts";

import { css } from "./styles.ts";

/** Adds the icon styles to the page once. The Vue, React, and Svelte components call it when they mount. */
export function addStyles(): void {
  if (document.querySelector("style[data-comark-icon]")) return;
  const style = document.createElement("style");
  style.dataset.comarkIcon = "";
  style.textContent = css;
  document.head.append(style);
}

/** The inline style of an icon: its image and, when it isn't square, its width over its height. */
export function iconStyle(src: string, ratio?: string | number): Record<string, string> {
  return {
    // The parse plugin writes safe URLs, but a component can be given any `src`: a quote, backslash, or line break
    // would end the CSS string it goes in.
    "--ci": `url("${src.replace(/["\\\n\r\f]/g, encodeURIComponent)}")`,
    ...(Number(ratio) && Number(ratio) !== 1 && { "--ci-ratio": String(Number(ratio)) }),
  };
}

export { css };

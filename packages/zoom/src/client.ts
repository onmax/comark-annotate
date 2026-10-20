import { script } from "./script.ts";
import { css } from "./styles.ts";

export type { ZoomDetail } from "./script.ts";

/**
 * Starts zoom for every `[data-zoom]` element on the page and returns a function that stops it. Every caller shares one
 * set of listeners, which stop with the last caller. It adds the bundled styles unless you pass others.
 */
export function start(styles: string = css): () => void {
  return script(styles);
}

export { css };
export { theme } from "./theme.ts";

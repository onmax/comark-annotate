// `::toc` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-toc`.
import Toc from "./Toc.svelte";

export { default } from "comark-toc";
export { Toc };
export const components = { Toc };

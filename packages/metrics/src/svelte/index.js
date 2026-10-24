// `:delta`, `:progress`, and `::stats` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-metrics`.
import Delta from "./Delta.svelte";
import ProgressBar from "./ProgressBar.svelte";

export { default, PROGRESS_TAG } from "comark-metrics";
export { Delta, ProgressBar };
export const components = { Delta, ProgressBar };

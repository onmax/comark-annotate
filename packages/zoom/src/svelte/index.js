// `::zoom` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-zoom`.
import Zoom from "./Zoom.svelte";
import ZoomRuntime from "./ZoomRuntime.svelte";

export { default, RUNTIME_TAG } from "comark-zoom";
export { Zoom, ZoomRuntime };
export const components = { Zoom, ZoomRuntime };

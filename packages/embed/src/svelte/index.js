// `::embed` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-embed`.
import Embed from "./Embed.svelte";

export { default } from "comark-embed";
export { Embed };
export const components = { Embed };

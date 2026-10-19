// `::carousel` and `:::slide` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-carousel`.
import Carousel from "./Carousel.svelte";
import Slide from "./Slide.svelte";

export { default } from "comark-carousel";
export { Carousel, Slide };
export const components = { Carousel, Slide };

import { defineComponent, h, onBeforeUnmount, onMounted } from "vue";
import { controls, css, start } from "./client.ts";

export { default } from "./index.ts";
export type { MediaAttributes, MediaMeta, MediaOptions } from "./index.ts";

/** Videos and audio for `@comark/vue`. */
export const Media = defineComponent({
  name: "Media",
  inheritAttrs: false,
  props: {
    kind: String,
    src: String,
    label: String,
    poster: String,
    autoplay: Boolean,
    loop: Boolean,
    muted: Boolean,
    native: Boolean,
  },
  setup(props) {
    let stop = () => {};
    onMounted(() => (stop = start(css)));
    onBeforeUnmount(() => stop());
    return () => {
      const { kind, src, label } = props;
      if ((kind !== "video" && kind !== "audio") || !src) return null;
      const video = kind === "video";
      const player = !video && !props.native;
      const attrs = {
        src,
        controls: true,
        playsinline: video || undefined,
        preload: "metadata",
        poster: video ? props.poster : undefined,
        autoplay: props.autoplay || undefined,
        loop: props.loop || undefined,
        muted: props.muted || undefined,
        "aria-label": label || undefined,
      };
      const fallback = [h("a", { href: src }, label || src)];
      // Vue writes `class=""` for an empty class, which the other renderers don't.
      const element = player
        ? h(kind, attrs, fallback)
        : h(kind, { class: "cm", ...attrs }, fallback);
      if (!player) return element;
      return h(
        "span",
        {
          class: "cm cm-audio",
          role: label ? "group" : undefined,
          "aria-label": label || undefined,
        },
        [element, h("span", { class: "cm-bar", innerHTML: controls })],
      );
    };
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Media };

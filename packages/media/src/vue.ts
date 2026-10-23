import { defineComponent, h, onMounted } from "vue";
import { addStyles } from "./client.ts";

export { default } from "./index.ts";
export type { MediaAttributes, MediaMeta } from "./index.ts";

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
  },
  setup(props) {
    onMounted(addStyles);
    return () => {
      const { kind, src, label } = props;
      if ((kind !== "video" && kind !== "audio") || !src) return null;
      const video = kind === "video";
      return h(
        kind,
        {
          class: "cm",
          src,
          controls: true,
          playsinline: video || undefined,
          preload: "metadata",
          poster: video ? props.poster : undefined,
          autoplay: props.autoplay || undefined,
          loop: props.loop || undefined,
          muted: props.muted || undefined,
          "aria-label": label || undefined,
        },
        [h("a", { href: src }, label || src)],
      );
    };
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Media };

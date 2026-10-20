import { defineComponent, h, onMounted } from "vue";
import { addStyles, allow, referrerPolicy } from "./client.ts";

export { default } from "./index.ts";
export type { EmbedAttributes, EmbedMeta, Size } from "./index.ts";

/** `::embed` for `@comark/vue`. */
export const Embed = defineComponent({
  name: "Embed",
  inheritAttrs: false,
  props: {
    provider: String,
    src: String,
    label: String,
    size: String,
    href: String,
    title: String,
    host: String,
  },
  setup(props) {
    onMounted(addStyles);
    return () => {
      if (!props.href) return null;
      if (!props.src)
        return h("a", { class: "ce-card", href: props.href }, [
          h("strong", props.title),
          h("span", props.host),
        ]);
      return h(
        "figure",
        { class: "ce", "data-provider": props.provider, "data-size": props.size },
        [
          h("div", { class: "ce-frame" }, [
            h("iframe", {
              src: props.src,
              title: props.label,
              loading: "lazy",
              allow,
              allowfullscreen: "",
              referrerpolicy: referrerPolicy,
            }),
          ]),
          h("figcaption", [h("a", { href: props.href }, props.title)]),
        ],
      );
    };
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Embed };

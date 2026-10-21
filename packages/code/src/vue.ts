import { defineComponent, h, onBeforeUnmount, onMounted } from "vue";
import { buttons, css, start } from "./client.ts";

export { default } from "./index.ts";

/** Code blocks for `@comark/vue`. */
export const Pre = defineComponent({
  name: "Pre",
  // Everything but `actions` belongs to the `pre` itself, such as Shiki's class and the block's language.
  inheritAttrs: false,
  props: {
    actions: { type: Array, default: () => [] },
  },
  setup(props, { attrs, slots }) {
    let stop = () => {};
    onMounted(() => (stop = start(css)));
    onBeforeUnmount(() => stop());
    return () =>
      h("div", { class: "ck" }, [
        h("pre", attrs, slots.default?.()),
        h("div", { class: "ck-bar", innerHTML: buttons(props.actions) }),
      ]);
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Pre };

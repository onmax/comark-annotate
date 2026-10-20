import {
  defineComponent,
  h,
  inject,
  type InjectionKey,
  onBeforeUnmount,
  onMounted,
  type PropType,
  provide,
  useId,
} from "vue";
import { css, start } from "./client.ts";

export { default } from "./index.ts";

const tabsId: InjectionKey<string> = Symbol("comark-tabs");

/** `::tabs` and `::code-group` for `@comark/vue`. */
export const Tabs = defineComponent({
  name: "Tabs",
  // The other renderers drop `{#id .class}`, so Vue drops it too instead of falling it through to the root.
  inheritAttrs: false,
  props: {
    // SAFETY: the parse plugin writes `labels` as an array of strings.
    labels: { type: Array as PropType<string[]>, default: () => [] },
    sync: String,
    code: [String, Boolean],
  },
  setup(props, { slots }) {
    const id = useId();
    provide(tabsId, id);
    let stop = () => {};
    onMounted(() => (stop = start(css)));
    onBeforeUnmount(() => stop());
    return () =>
      h(
        "div",
        {
          class: "ct",
          "data-tabs-code": props.code ? "" : undefined,
          "data-tabs-sync": props.sync || undefined,
        },
        [
          h(
            "div",
            { class: "ct-list", role: "tablist" },
            props.labels.map((label, at) =>
              h(
                "button",
                {
                  type: "button",
                  class: "ct-tab",
                  role: "tab",
                  id: `${id}-tab-${at + 1}`,
                  "aria-controls": `${id}-panel-${at + 1}`,
                  "aria-selected": String(at === 0),
                  tabindex: at === 0 ? "0" : "-1",
                },
                label,
              ),
            ),
          ),
          slots.default?.(),
        ],
      );
  },
});

/** `:::tabs-item` for `@comark/vue`. */
export const TabsItem = defineComponent({
  name: "TabsItem",
  inheritAttrs: false,
  props: {
    label: String,
    index: [String, Number],
  },
  setup(props, { slots }) {
    const id = inject(tabsId, "");
    return () => {
      const index = Number(props.index) || 1;
      return h(
        "div",
        {
          class: "ct-panel",
          role: "tabpanel",
          id: `${id}-panel-${index}`,
          "aria-labelledby": `${id}-tab-${index}`,
          tabindex: "0",
          "data-inactive": index > 1 ? "" : undefined,
        },
        [h("div", { class: "ct-caption" }, props.label), slots.default?.()],
      );
    };
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Tabs, TabsItem };

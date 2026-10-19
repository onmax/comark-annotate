import { css as zoomCss, start as startZoom } from "comark-zoom/client";
import { defineComponent, h, onBeforeUnmount, onMounted } from "vue";
import { css, start } from "./client.ts";

export { default } from "./index.ts";

const off = (value: unknown) => value === false || value === "false";

/** `::carousel` for `@comark/vue`. */
export const Carousel = defineComponent({
  name: "Carousel",
  props: {
    count: [String, Number],
    columns: [String, Number],
    title: String,
    zoom: { type: [Boolean, String], default: undefined },
  },
  setup(props, { slots }) {
    let stops: (() => void)[] = [];
    onMounted(() => (stops = [start(css), ...(off(props.zoom) ? [] : [startZoom(zoomCss)])]));
    onBeforeUnmount(() => stops.forEach((stop) => stop()));
    return () => {
      const count = Number(props.count) || 0;
      const columns = Math.min(3, Math.max(1, Number(props.columns) || 1));
      const controls =
        count > 1
          ? h("div", { class: "cc-controls" }, [
              h(
                "button",
                {
                  type: "button",
                  class: "cc-step",
                  "data-carousel-step": "-1",
                  "aria-label": "Previous slide",
                  disabled: true,
                },
                "‹",
              ),
              h(
                "div",
                { class: "cc-dots" },
                Array.from({ length: count }, (_, index) =>
                  h("button", {
                    type: "button",
                    class: "cc-dot",
                    "data-carousel-to": String(index),
                    "aria-label": `Slide ${index + 1}`,
                    "aria-current": String(index === 0),
                  }),
                ),
              ),
              h(
                "button",
                {
                  type: "button",
                  class: "cc-step",
                  "data-carousel-step": "1",
                  "aria-label": "Next slide",
                },
                "›",
              ),
            ])
          : null;
      return h(
        "div",
        {
          class: "cc",
          "data-columns": columns > 1 ? String(columns) : undefined,
          "data-fits": count <= columns ? "" : undefined,
          "data-zoom-gallery": off(props.zoom) ? undefined : "",
          role: "region",
          "aria-roledescription": "carousel",
          "aria-label": props.title ?? "Carousel",
        },
        [h("div", { class: "cc-track" }, slots.default?.()), controls],
      );
    };
  },
});

/** `:::slide` for `@comark/vue`. */
export const Slide = defineComponent({
  name: "Slide",
  props: {
    index: [String, Number],
    count: [String, Number],
    title: String,
    zoom: { type: [Boolean, String], default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const zoom = !off(props.zoom);
      return h(
        "div",
        {
          class: "cc-slide",
          role: "group",
          "aria-roledescription": "slide",
          "aria-label": `${props.index} of ${props.count}`,
          "data-zoom": zoom ? "" : undefined,
          tabindex: zoom ? "0" : undefined,
          "data-zoom-title": zoom ? props.title : undefined,
        },
        slots.default?.(),
      );
    };
  },
});

/** Pass these as `components` to `@comark/vue`. */
export const components = { Carousel, Slide };

import type { Component, Snippet } from "svelte";

export { default, RUNTIME_TAG } from "comark-zoom";
export type { ZoomOptions } from "comark-zoom";
export type { ZoomDetail } from "comark-zoom/client";

export declare const Zoom: Component<{
  id?: string;
  class?: string;
  group?: string;
  title?: string;
  children?: Snippet;
}>;
export declare const ZoomRuntime: Component;
export declare const components: { Zoom: typeof Zoom; ZoomRuntime: typeof ZoomRuntime };

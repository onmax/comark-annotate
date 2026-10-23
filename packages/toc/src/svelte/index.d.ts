import type { Component, Snippet } from "svelte";
import type { TocAttributes } from "comark-toc";

export { default } from "comark-toc";
export type { TocAttributes, TocMeta } from "comark-toc";

export declare const Toc: Component<TocAttributes & { children?: Snippet }>;
export declare const components: { Toc: typeof Toc };

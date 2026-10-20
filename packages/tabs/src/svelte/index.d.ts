import type { Component, Snippet } from "svelte";

export { default } from "comark-tabs";
export type { TabsMeta } from "comark-tabs";

export declare const Tabs: Component<{
  labels?: string[];
  sync?: string;
  code?: string | boolean;
  children?: Snippet;
}>;
export declare const TabsItem: Component<{
  label?: string;
  index?: string | number;
  children?: Snippet;
}>;
export declare const components: { Tabs: typeof Tabs; TabsItem: typeof TabsItem };

import type { Component, Snippet } from "svelte";

export { default } from "comark-code";
export type { CodeAction, CodeOptions } from "comark-code";

export declare const Pre: Component<{
  actions?: { id: string; label: string }[];
  children?: Snippet;
  [attribute: string]: unknown;
}>;
export declare const components: { Pre: typeof Pre };

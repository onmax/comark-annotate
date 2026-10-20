import type { Component, Snippet } from "svelte";

export { CALLOUT_TAG, default } from "comark-github-callouts";
export type { CalloutType, GithubCalloutsOptions } from "comark-github-callouts";

export declare const GithubCallout: Component<{
  type?: string;
  title?: string;
  children?: Snippet;
}>;
export declare const components: { GithubCallout: typeof GithubCallout };

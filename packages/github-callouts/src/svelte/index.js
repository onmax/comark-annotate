// Callouts for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-github-callouts`.
import GithubCallout from "./GithubCallout.svelte";

export { CALLOUT_TAG, default } from "comark-github-callouts";
export { GithubCallout };
export const components = { GithubCallout };

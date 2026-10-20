// `::tabs`, `::code-group`, and `:::tabs-item` for `@comark/svelte`. Pass `components` to it; the parse plugin comes from `comark-tabs`.
import Tabs from "./Tabs.svelte";
import TabsItem from "./TabsItem.svelte";

export { default } from "comark-tabs";
export { Tabs, TabsItem };
export const components = { Tabs, TabsItem };

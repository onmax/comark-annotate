import type { Component } from "svelte";
import type { Preset, PresetOptions } from "@onmax/comark";

export { criticCss } from "@onmax/comark";
export type { PresetOptions } from "@onmax/comark";

/** Every plugin with components for `@comark/svelte`, which leaves out annotate and diff. */
declare const onmax: (options?: PresetOptions) => Preset<Component>;
export default onmax;

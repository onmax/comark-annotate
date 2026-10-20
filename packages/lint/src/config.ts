import type { LintOptions } from "./index.ts";

export type Config = LintOptions;

/** Types a `comark-lint.config.ts`. Its plugins and components are added to the installed comark-plugins packages. */
export const defineConfig = (config: Config): Config => config;

// Each one is an optional peer dependency, so a project lints with exactly the plugins it renders with.
const packages = [
  () => import("comark-annotate/html"),
  () => import("comark-carousel/html"),
  () => import("comark-github-callouts/html"),
  () => import("comark-zoom/html"),
];

/** The parse plugins and components of every comark-plugins package installed, plus `config`'s. */
export async function resolveConfig(config: Config = {}): Promise<Required<LintOptions>> {
  const loaded = await Promise.all(packages.map((load) => load().catch(() => undefined)));
  const found = loaded.filter((module) => module !== undefined);
  const extra = config.components ?? [];
  return {
    plugins: [...found.map((module) => module.default()), ...(config.plugins ?? [])],
    components: [
      ...found.flatMap((module) => Object.keys(module.components)),
      ...(Array.isArray(extra) ? extra : Object.keys(extra)),
    ],
  };
}

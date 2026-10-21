import type { LintOptions } from "./index.ts";

export type Config = LintOptions;

/** Types a `comark-lint.config.ts`. Its plugins and components are added to the installed comark-plugins packages. */
export const defineConfig = (config: Config): Config => config;

// Each one is an optional peer dependency, so a project lints with exactly the plugins it renders with.
const packages = [
  ["comark-annotate/html", () => import("comark-annotate/html")],
  ["comark-carousel/html", () => import("comark-carousel/html")],
  ["comark-charts/html", () => import("comark-charts/html")],
  ["comark-github-callouts/html", () => import("comark-github-callouts/html")],
  ["comark-icon/html", () => import("comark-icon/html")],
  ["comark-tabs/html", () => import("comark-tabs/html")],
  ["comark-zoom/html", () => import("comark-zoom/html")],
] as const;

const missing = (error: unknown, name: string) =>
  error instanceof Error &&
  "code" in error &&
  error.code === "ERR_MODULE_NOT_FOUND" &&
  error.message.match(/Cannot find package '([^']+)'/)?.[1] === name.split("/", 1)[0];

/** The parse plugins and components of every comark-plugins package installed, plus `config`'s. */
export async function resolveConfig(config: Config = {}): Promise<Required<LintOptions>> {
  const loaded = await Promise.all(
    packages.map(async ([name, load]) => {
      try {
        return await load();
      } catch (error) {
        if (missing(error, name)) return undefined;
        throw error;
      }
    }),
  );
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

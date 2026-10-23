import type { LintOptions } from "./index.ts";

export type Config = LintOptions;

/** Types a `lint-comark.config.ts`. Its plugins and components are added to the installed comark-plugins packages. */
export const defineConfig = (config: Config): Config => config;

// Each one is an optional peer dependency, so a project lints with exactly the plugins it renders with. The names
// after a loader are blocks its renderer has no component for: comark-tabs turns `::code-group` into tabs while
// parsing, and renders each `:::tabs-item` inside `::tabs`.
const packages = [
  ["comark-annotate/html", () => import("comark-annotate/html"), []],
  ["comark-carousel/html", () => import("comark-carousel/html"), []],
  ["comark-code/html", () => import("comark-code/html"), []],
  [
    "comark-charts/html",
    // Linting reads no drawings, so it loads no Vega.
    () =>
      import("comark-charts/html").then((module) => ({
        ...module,
        default: () => module.default({ draw: false }),
      })),
    [],
  ],
  ["comark-embed/html", () => import("comark-embed/html"), []],
  [
    "comark-github/html",
    // Of its plugins only callouts make blocks; references and raw HTML have nothing to lint.
    () => import("comark-github/html").then((module) => ({ ...module, default: module.callouts })),
    [],
  ],
  [
    "comark-chips/html",
    // Linting reads no images, so it downloads none.
    () =>
      import("comark-chips/html").then((module) => ({
        ...module,
        default: () => module.default({ download: false }),
      })),
    [],
  ],
  // Syntax plugins have no components, and are loaded so their syntax isn't read as something else.
  [
    "comark-deflist",
    () => import("comark-deflist").then((module) => ({ ...module, components: {} })),
    [],
  ],
  ["comark-diff/html", () => import("comark-diff/html"), []],
  ["comark-icon/html", () => import("comark-icon/html"), []],
  ["comark-media/html", () => import("comark-media/html"), []],
  ["comark-steps/html", () => import("comark-steps/html"), []],
  ["comark-cards/html", () => import("comark-cards/html"), []],
  ["comark-badge/html", () => import("comark-badge/html"), []],
  [
    "comark-reading-time",
    // It writes only `meta`, so it has no components and nothing to lint, but it runs as the host's would.
    () => import("comark-reading-time").then((module) => ({ ...module, components: {} })),
    [],
  ],
  ["comark-tabs/html", () => import("comark-tabs/html"), ["code-group", "tabs-item"]],
  ["comark-zoom/html", () => import("comark-zoom/html"), []],
] as const;

const missing = (error: unknown, name: string) =>
  error instanceof Error &&
  "code" in error &&
  error.code === "ERR_MODULE_NOT_FOUND" &&
  error.message.match(/Cannot find package '([^']+)'/)?.[1] === name.split("/", 1)[0];

/** The parse plugins and components of every comark-plugins package installed, plus `config`'s. */
export async function resolveConfig(config: Config = {}): Promise<Required<LintOptions>> {
  const loaded = await Promise.all(
    packages.map(async ([name, load, blocks]) => {
      try {
        return { module: await load(), blocks };
      } catch (error) {
        if (missing(error, name)) return undefined;
        throw error;
      }
    }),
  );
  const found = loaded.filter((entry) => entry !== undefined);
  const extra = config.components ?? [];
  return {
    plugins: [...found.map(({ module }) => module.default()), ...(config.plugins ?? [])],
    components: [
      ...found.flatMap(({ module, blocks }) => [...Object.keys(module.components), ...blocks]),
      ...(Array.isArray(extra) ? extra : Object.keys(extra)),
    ],
  };
}

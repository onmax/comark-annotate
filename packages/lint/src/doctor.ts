import type { RuleContext } from "vite-doctor/extension";
import {
  createRule,
  defineDoctorDiagnostics,
  defineDoctorExtension,
  defineRulePack,
} from "vite-doctor/extension";
import { lint, resolveConfig, type Config, type Diagnostic, type Rule } from "./index.ts";
import { catalog } from "./rules/index.ts";

export type DoctorOptions = Config & {
  /** Markdown to check, relative to the project root. Default `**\/*.{md,mdc}`. */
  include?: string;
  /** Globs to skip. Default `node_modules` and `dist`. */
  exclude?: readonly string[];
};

// SAFETY: built from every entry of the catalog, whose keys are exactly the rules.
const ids = Object.keys(catalog) as Rule[];
const ruleOf = new Map(ids.map((id) => [catalog[id].code, id]));

const diagnostics = defineDoctorDiagnostics(
  ids.map((ruleId) => ({ code: catalog[ruleId].code, ruleId })),
  {
    docsBase: (code) => {
      const rule = ruleOf.get(code);
      return rule && `https://comark.onmax.me/doctor/${rule.replace(/^comark\//, "")}/`;
    },
  },
);

/**
 * A Doctor Extension that lints the project's Markdown with lint-comark. Register it in
 * `doctor.config.ts` and run `vite-doctor . --config doctor.config.ts`.
 */
export default function comark(options: DoctorOptions = {}) {
  const {
    include = "**/*.{md,mdc}",
    exclude = ["**/node_modules/**", "**/dist/**"],
    ...config
  } = options;

  // Every Rule reads the same results; the first one to run lints the files.
  const lintProject = (ctx: RuleContext) => {
    const key = `lint-comark:${ctx.project.root}`;
    let results =
      ctx.cache.get<Promise<{ file: string; text: string; found: Diagnostic[] }[]>>(key);
    if (!results) {
      results = resolveConfig(config).then((resolved) =>
        Promise.all(
          ctx.fs.glob(include, { exclude }).map(async (file) => {
            const text = ctx.fs.readText(file) ?? "";
            return { file, text, found: await lint(text, resolved) };
          }),
        ),
      );
      ctx.cache.set(key, results);
    }
    return results;
  };

  const doctorRules = ids.map((id) =>
    createRule({
      meta: {
        id,
        title: catalog[id].title,
        category: "content",
        severity: catalog[id].severity ?? "warn",
        execution: "manifest",
        // The result depends on the comark plugins installed, which the Rule imports instead of reading.
        cacheScope: "none",
      },
      create(ctx) {
        return {
          async onProjectEnd() {
            for (const { file, text, found } of await lintProject(ctx)) {
              const starts = [0];
              for (const match of text.matchAll(/\n/g)) starts.push(match.index + 1);
              for (const diagnostic of found) {
                if (diagnostic.rule !== id) continue;
                const start = (starts[diagnostic.line - 1] ?? 0) + (diagnostic.column ?? 1) - 1;
                ctx.report(
                  diagnostics.diagnostics[catalog[id].code]({
                    why: diagnostic.message,
                    fix: diagnostic.fix,
                  }),
                  { file, range: ctx.helpers.rangeFromOffsets(file, text, start) },
                );
              }
            }
          },
        };
      },
    }),
  );

  return defineDoctorExtension({
    name: "comark",
    rulePacks: [
      defineRulePack({
        name: "comark",
        version: "1.0.0",
        rules: doctorRules,
        diagnostics,
        presets: { recommended: ids },
      }),
    ],
  });
}

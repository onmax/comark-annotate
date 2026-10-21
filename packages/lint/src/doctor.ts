import type { RuleContext, RuleMeta } from "vite-doctor/extension";
import {
  createRule,
  defineDoctorDiagnostics,
  defineDoctorExtension,
  defineRulePack,
} from "vite-doctor/extension";
import { lint, resolveConfig, rules, type Config, type Diagnostic, type Rule } from "./index.ts";

export type DoctorOptions = Config & {
  /** Markdown to check, relative to the project root. Default `**\/*.{md,mdc}`. */
  include?: string;
  /** Globs to skip. Default `node_modules` and `dist`. */
  exclude?: readonly string[];
};

const codes = {
  "comark/unclosed-block": "COMARK0001",
  "comark/unknown-component": "COMARK0002",
  "comark/malformed-attributes": "COMARK0003",
  "comark/broken-anchor": "COMARK0004",
  "comark/invalid-frontmatter": "COMARK0005",
  "comark/plugin-issue": "COMARK0006",
  "comark/unsafe-url": "COMARK0007",
} as const satisfies Record<Rule, string>;

const severities: Partial<Record<Rule, RuleMeta["severity"]>> = {
  "comark/invalid-frontmatter": "error",
  "comark/unsafe-url": "error",
};

const diagnostics = defineDoctorDiagnostics(
  Object.entries(codes).map(([ruleId, code]) => ({ code, ruleId })),
  { docsBase: (code) => `https://comark.onmax.me/lint/#${code.toLowerCase()}` },
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
  // SAFETY: `rules` is a Record<Rule, string>, so its keys are exactly the rules.
  const ids = Object.keys(rules) as Rule[];

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
        title: rules[id],
        category: "content",
        severity: severities[id] ?? "warn",
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
                  diagnostics.diagnostics[codes[id]]({
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

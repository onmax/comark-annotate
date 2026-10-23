import type { RuleContext, RuleMeta } from "vite-doctor/extension";
import {
  createRule,
  defineDoctorDiagnostics,
  defineDoctorExtension,
  defineRulePack,
} from "vite-doctor/extension";
import {
  lintFiles,
  resolveConfig,
  rules,
  type Config,
  type LintedFile,
  type Rule,
} from "./index.ts";

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
  "comark/broken-link": "COMARK0008",
  "comark/blocked-url": "COMARK0009",
  "comark/dead-url": "COMARK0010",
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

  // Every Rule reads the same results; the first one to run lints the files. Rules may only read through `ctx.fs`,
  // so links are checked through it too. The URL cache is written with node:fs, since `ctx.fs` can't write.
  const lintProject = (ctx: RuleContext) => {
    const key = `lint-comark:${ctx.project.root}`;
    let results = ctx.cache.get<Promise<LintedFile[]>>(key);
    if (!results) {
      results = resolveConfig(config).then((resolved) =>
        lintFiles(ctx.fs.glob(include, { exclude }), {
          ...resolved,
          root: ctx.project.root,
          read: (path) => ctx.fs.readText(path),
          exists: (path) => ctx.fs.exists(path),
          list: (path) => ctx.fs.readDir(path)?.map((entry) => entry.name),
        }),
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
        ...(id === "comark/dead-url" && { determinism: "env-dependent" as const }),
      },
      create(ctx) {
        return {
          async onProjectEnd() {
            for (const { file, text = "", diagnostics: found } of await lintProject(ctx)) {
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

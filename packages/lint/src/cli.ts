#!/usr/bin/env node
import { glob, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { lint, resolveConfig, type Config, type Diagnostic } from "./index.ts";

const USAGE = `Usage: comark-lint <file or glob>... [--format text|json] [--config comark-lint.config.ts]

Checks Comark documents with every comark-plugins package installed. Exits with 1 if there are problems.`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    format: { type: "string", default: "text" },
    config: { type: "string", short: "c" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help || !positionals.length || (values.format !== "text" && values.format !== "json")) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 2);
}

let failed = false;
const fail = (message: string) => {
  console.error(`comark-lint: ${message}`);
  failed = true;
};

let config: Config = {};
if (values.config) {
  try {
    // SAFETY: a config module's default export is the object defineConfig returns.
    const module = (await import(pathToFileURL(resolve(values.config)).href)) as {
      default?: Config;
    };
    config = module.default ?? {};
  } catch (error) {
    fail(`can't load ${values.config}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }
}
const options = await resolveConfig(config);

const files: string[] = [];
for (const input of positionals) {
  if (!/[*?[\]{}]/.test(input)) {
    files.push(input);
    continue;
  }
  const matches: string[] = [];
  for await (const match of glob(input, {
    exclude: (path) => /(?:^|[/\\])(?:node_modules|dist)$/.test(path),
  }))
    matches.push(match);
  if (!matches.length) fail(`${input} matches no files`);
  files.push(...matches.sort());
}

const results: (Diagnostic & { file: string })[] = [];
for (const file of new Set(files)) {
  let markdown: string;
  try {
    markdown = await readFile(file, "utf8");
  } catch {
    fail(`can't read ${file}`);
    continue;
  }
  for (const diagnostic of await lint(markdown, options)) results.push({ file, ...diagnostic });
}

if (values.format === "json") console.log(JSON.stringify(results, null, 2));
else {
  for (const { file, line, column, rule, message, fix } of results)
    console.log(`${file}:${line}:${column ?? 1} ${rule} ${message} ${fix}`);
  if (!results.length && !failed) console.log("No problems.");
}
process.exit(failed ? 2 : results.length ? 1 : 0);

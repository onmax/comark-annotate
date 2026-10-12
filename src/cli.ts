#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import { escapeHtml } from "comark/utils";
import annotate, { components } from "./html.ts";

const USAGE = `Usage:
  comark-annotate check <file.md>               List every problem. Exits with 1 if there are any.
  comark-annotate render <file.md> [-o out.html] Write a standalone page to preview, next to the file by default.`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { out: { type: "string", short: "o" }, help: { type: "boolean", short: "h" } },
});
const [command, input] = positionals;

if (values.help || !input || (command !== "check" && command !== "render")) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 2);
}

const document = await parseMarkdown(await readFile(input, "utf8"), { plugins: [annotate()] });
const issues = document.meta.annotateIssues;
for (const issue of issues) console.error(issue);

if (command === "render") {
  const out = values.out ?? `${input.replace(/\.md$/i, "")}.html`;
  const body = await renderHtmlFromDocument(document, { components });
  // Plain page chrome only; the annotation styles come inlined with the body.
  await writeFile(
    out,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(basename(input))}</title><style>:root{color-scheme:light dark}body{max-width:60rem;margin:0 auto;padding:2.5rem 1.5rem;font:16px/1.6 system-ui,sans-serif}img{max-width:100%}</style></head><body>${body}</body></html>\n`,
  );
  console.log(`Wrote ${out}`);
} else if (!issues.length) console.log("No problems.");

process.exit(issues.length ? 1 : 0);

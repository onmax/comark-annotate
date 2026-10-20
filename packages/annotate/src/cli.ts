#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import { escapeHtml } from "comark/utils";
import carousel, { components as carouselComponents } from "comark-carousel/html";
import zoom, { components as zoomComponents } from "comark-zoom/html";
import annotate, { components as annotateComponents } from "./html.ts";

const USAGE = `Usage:
  comark-annotate check <file.md>...               List every problem. Exits with 1 if there are any.
  comark-annotate render <file.md>... [-o out.html] Write a standalone page to preview, next to each file by default.`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { out: { type: "string", short: "o" }, help: { type: "boolean", short: "h" } },
});
const [command, ...inputs] = positionals;

if (values.help || !inputs.length || (command !== "check" && command !== "render")) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 2);
}
if (values.out && inputs.length > 1) {
  console.error(
    "comark-annotate: -o takes one file; leave it out to write each page next to its file.",
  );
  process.exit(2);
}

// The same plugins as the docs, so a document that mixes in carousels and zoom checks and previews as it would publish.
const components = { ...annotateComponents, ...carouselComponents, ...zoomComponents };
let found = 0;
let failed = false;
const fail = (message: string) => {
  console.error(`comark-annotate: ${message}`);
  failed = true;
};

for (const input of inputs) {
  let markdown: string;
  try {
    markdown = await readFile(input, "utf8");
  } catch {
    fail(`can't read ${input}`);
    continue;
  }
  const document = await parseMarkdown(markdown, { plugins: [annotate(), carousel(), zoom()] });
  const issues = document.meta.issues ?? [];
  for (const issue of issues) console.error(inputs.length > 1 ? `${input}: ${issue}` : issue);
  found += issues.length;

  if (command !== "render") continue;
  const out = values.out ?? `${input.replace(/\.md$/i, "")}.html`;
  const body = await renderHtmlFromDocument(document, { components });
  try {
    // Plain page chrome only; the plugins' styles come inlined with the body.
    await writeFile(
      out,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(basename(input))}</title><style>:root{color-scheme:light dark}body{max-width:60rem;margin:0 auto;padding:2.5rem 1.5rem;font:16px/1.6 system-ui,sans-serif}img{max-width:100%}</style></head><body>${body}</body></html>\n`,
    );
    console.log(`Wrote ${out}`);
  } catch {
    fail(`can't write ${out}`);
  }
}

if (command === "check" && !found && !failed) console.log("No problems.");
process.exit(failed ? 2 : found ? 1 : 0);

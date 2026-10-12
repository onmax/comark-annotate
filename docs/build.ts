// Renders docs/index.md with comark-annotate itself into docs/dist, a static site served by Cloudflare.
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import annotate, { components } from "../src/html.ts";

const root = new URL("./", import.meta.url);
const dist = new URL("dist/", root);

const document = await parseMarkdown(await readFile(new URL("index.md", root), "utf8"), {
  plugins: [annotate()],
});
if (document.meta.annotateIssues.length)
  throw new Error(
    `docs/index.md has annotation issues:\n${document.meta.annotateIssues.join("\n")}`,
  );
const { title, description } = document.frontmatter as { title: string; description: string };

const style = `
:root{color-scheme:light dark;--fg:#1f2430;--muted:#6b7180;--bg:#fff;--soft:#f4f5f7;--line:#e3e5ea;--link:#2f5bea}
@media (prefers-color-scheme:dark){:root{--fg:#e6e8ee;--muted:#9aa0ad;--bg:#14161b;--soft:#1d2027;--line:#2c3039;--link:#8aa4ff}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,-apple-system,sans-serif}
main{max-width:56rem;margin:0 auto;padding:4rem 1.5rem 6rem}
h1{font-size:2.25rem;line-height:1.15;margin:0 0 1rem;letter-spacing:-.02em}
h2{font-size:1.4rem;margin:3rem 0 .75rem}
h3{font-size:1.05rem;margin:2rem 0 .5rem}
a{color:var(--link)}
p,li{max-width:42rem}
code{font:.875em/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--soft);padding:.1em .35em;border-radius:4px}
pre{background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:1rem;overflow:auto}
pre code{background:none;padding:0}
table{border-collapse:collapse;margin:1rem 0;font-size:.95em}
th,td{text-align:left;padding:.45rem .9rem .45rem 0;border-bottom:1px solid var(--line);vertical-align:top}
th:empty{display:none}
`;

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL("public/", root), dist, { recursive: true });
await writeFile(
  new URL("index.html", dist),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<style>${style.trim()}</style>
</head>
<body><main>${await renderHtmlFromDocument(document, { components })}</main></body>
</html>
`,
);
console.log(`docs/dist/index.html written`);

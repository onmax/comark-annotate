// Renders docs/index.md with comark-annotate itself into docs/dist, a static site served by Cloudflare.
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { renderHtmlFromDocument } from "@comark/html";
import shiki from "@comark/html/plugins/shiki";
import type { ElementNode, Node, NodeHandler } from "comark";
import { parseMarkdown } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";
import annotate, { components } from "../src/html.ts";

const root = new URL("./", import.meta.url);
const dist = new URL("dist/", root);
const fonts = new URL("../node_modules/geist/dist/fonts/", root);
const plugins = [annotate(), shiki({ themes: { light, dark } })];

const isElement = (node: Node): node is ElementNode =>
  Array.isArray(node) && typeof node[0] === "string";
const str = (value: unknown) => (typeof value === "string" ? value : "");

// An example shows the Markdown in its code block twice: rendered, and as source.
const example: NodeHandler = async ([, attrs, ...children], state) => {
  const pre = children.find((child) => isElement(child) && child[0] === "pre") as ElementNode;
  const source = textContent(pre);
  const preview = await parseMarkdown(source, { plugins: [annotate()] });
  if (preview.meta.annotateIssues.length)
    throw new Error(`Example "${str(attrs.label)}":\n${preview.meta.annotateIssues.join("\n")}`);
  return (
    `<div class="example"><div class="example-bar"><div class="seg" role="group" aria-label="View">` +
    `<button type="button" data-view="preview" aria-pressed="true">Preview</button><button type="button" data-view="code" aria-pressed="false">Code</button></div></div>` +
    `<div class="example-preview">${await state.flow(["div", {}, ...preview.nodes], state)}</div>` +
    `<div class="example-code" hidden>${await state.one(pre, state)}</div></div>`
  );
};

const tabs: NodeHandler = async ([, , ...children], state) => {
  const panels = children.filter(isElement);
  const labels = panels.map((panel, i) => {
    const label = escapeHtml(str(panel[1].label) || `Example ${i + 1}`);
    return `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${label}</button>`;
  });
  const bodies = await Promise.all(
    panels.map(
      async (panel, i) =>
        `<div role="tabpanel" data-tab="${i}"${i ? " hidden" : ""}>${await state.one(panel, state)}</div>`,
    ),
  );
  return `<div class="tabs"><div class="tablist" role="tablist">${labels.join("")}</div>${bodies.join("")}</div>`;
};

const document = await parseMarkdown(await readFile(new URL("index.md", root), "utf8"), {
  plugins,
});
if (document.meta.annotateIssues.length)
  throw new Error(`docs/index.md:\n${document.meta.annotateIssues.join("\n")}`);
const { title, description } = document.frontmatter as { title: string; description: string };

const nav = document.nodes
  .filter(isElement)
  .filter(([tag]) => tag === "h2" || tag === "h3")
  .map(
    ([tag, attrs, ...children]) =>
      `<a class="nav-${tag}" href="#${str(attrs.id)}">${escapeHtml(textContent([tag, attrs, ...children]))}</a>`,
  )
  .join("");

const body = await renderHtmlFromDocument(document, {
  components: { ...components, example, tabs },
});

const github = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const logo = `<span class="logo" aria-hidden="true">1</span>`;

// Tabs, the Preview/Code switch, copy buttons, and the active sidebar link. Without it the page still reads top to bottom.
const script = `
for (const t of document.querySelectorAll(".tabs")) t.querySelector(".tablist").addEventListener("click", e => {
  const b = e.target.closest("[role=tab]"); if (!b) return;
  for (const x of t.querySelectorAll("[role=tab]")) x.setAttribute("aria-selected", x === b);
  for (const p of t.querySelectorAll(":scope > [role=tabpanel]")) p.hidden = p.dataset.tab !== b.dataset.tab;
});
for (const ex of document.querySelectorAll(".example")) ex.querySelector(".seg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  for (const x of ex.querySelectorAll(".seg button")) x.setAttribute("aria-pressed", x === b);
  ex.querySelector(".example-preview").hidden = b.dataset.view !== "preview";
  ex.querySelector(".example-code").hidden = b.dataset.view !== "code";
});
for (const pre of document.querySelectorAll("pre")) {
  const b = document.createElement("button"); b.className = "copy"; b.type = "button"; b.textContent = "Copy";
  b.onclick = async () => { await navigator.clipboard.writeText(pre.querySelector("code").innerText.trimEnd()); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1500) };
  pre.append(b);
}
const links = [...document.querySelectorAll(".sidebar a")];
const spy = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) for (const a of links) a.toggleAttribute("data-active", a.hash === "#" + e.target.id);
}, { rootMargin: "0px 0px -70% 0px" });
for (const h of document.querySelectorAll("main h2[id], main h3[id]")) spy.observe(h);
`;

await rm(dist, { recursive: true, force: true });
await mkdir(new URL("fonts/", dist), { recursive: true });
await cp(new URL("public/", root), dist, { recursive: true });
for (const font of ["geist-sans/Geist-Variable.woff2", "geist-mono/GeistMono-Variable.woff2"])
  await cp(new URL(font, fonts), new URL(`fonts/${font.split("/")[1]}`, dist));

await writeFile(
  new URL("index.html", dist),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · ${description}</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${await readFile(new URL("style.css", root), "utf8")}</style>
</head>
<body>
<header class="top">
<a class="name" href="/">${logo}${title}</a>
<nav><a href="https://npmx.dev/package/comark-annotate">npm</a><a class="gh" href="https://github.com/onmax/comark-annotate">${github}<span>GitHub</span></a></nav>
</header>
<div class="layout">
<aside class="sidebar"><nav aria-label="On this page"><a class="nav-h2" href="#">Introduction</a>${nav}</nav></aside>
<div class="content">
<div class="hero enter"><h1>${title}</h1></div>
<main class="enter" style="--i:1">${body}</main>
<footer><span>Built on <a href="https://comark.dev">Comark</a> by the <a href="https://github.com/comarkdown">Comark team</a>. Marks from <a href="https://annotationkit.vercel.app">AnnotationKit</a>.</span><span>Made by <a href="https://onmax.me">Maxi García</a></span></footer>
</div>
</div>
<script>${script.trim()}</script>
</body>
</html>
`,
);
console.log("docs/dist/index.html written");

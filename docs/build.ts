// Renders docs/pages with the plugins themselves into docs/dist, a static site served by Cloudflare at comark.onmax.me.
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { renderHtmlFromDocument } from "@comark/html";
import shiki from "@comark/html/plugins/shiki";
import type { ElementNode, Node, NodeHandler } from "comark";
import { parseMarkdown } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import githubCallouts, {
  components as githubCalloutsComponents,
} from "../packages/github-callouts/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";

const root = new URL("./", import.meta.url);
const dist = new URL("dist/", root);
const fonts = new URL("../node_modules/geist/dist/fonts/", root);
const site = "https://comark.onmax.me";
const contentPlugins = () => [annotate(), carousel(), embed(), githubCallouts(), zoom()];
const plugins = [...contentPlugins(), shiki({ themes: { light, dark } })];
const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
  ...zoomComponents,
};

// The index first, then one page per package, each at its own path.
const pages = [
  { slug: "", file: "index.md" },
  { slug: "annotate", file: "annotate.md", npm: "comark-annotate" },
  { slug: "zoom", file: "zoom.md", npm: "comark-zoom" },
  { slug: "carousel", file: "carousel.md", npm: "comark-carousel" },
  { slug: "github-callouts", file: "github-callouts.md", npm: "comark-github-callouts" },
  { slug: "embed", file: "embed.md", npm: "comark-embed" },
];

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const str = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);
const isPre = (node: Node): node is ElementNode => isElement(node) && node[0] === "pre";

// An example shows the Markdown in its code block twice: rendered, and as source.
const example: NodeHandler = async ([, attrs, ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error(`Example "${str(attrs.label)}" needs a fenced code block.`);
  const source = textContent(pre);
  const preview = await parseMarkdown(source, { plugins: contentPlugins() });
  if (preview.meta.issues.length)
    throw new Error(`Example "${str(attrs.label)}":\n${preview.meta.issues.join("\n")}`);
  return (
    `<div class="example"><div class="example-bar"><div class="seg" role="group" aria-label="View">` +
    `<button type="button" data-view="preview" aria-pressed="true">Preview</button><button type="button" data-view="code" aria-pressed="false">Code</button></div></div>` +
    `<div class="example-body"><div class="example-preview">${await state.flow(["div", {}, ...preview.nodes], state)}</div>` +
    `<div class="example-code" hidden>${await state.one(pre, state)}</div></div></div>`
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

const nav = (document: { nodes: Node[] }) =>
  document.nodes
    .filter(isElement)
    .filter(([tag]) => tag === "h2" || tag === "h3")
    .map(
      ([tag, attrs, ...children]) =>
        `<a class="nav-${tag}" href="#${str(attrs.id)}">${escapeHtml(textContent([tag, attrs, ...children]))}</a>`,
    )
    .join("");

const parsed = await Promise.all(
  pages.map(async (page) => {
    const document = await parseMarkdown(
      await readFile(new URL(`pages/${page.file}`, root), "utf8"),
      { plugins },
    );
    if (document.meta.issues.length)
      throw new Error(`docs/pages/${page.file}:\n${document.meta.issues.join("\n")}`);
    const [title, description, tagline, install] = [
      "title",
      "description",
      "tagline",
      "install",
    ].map((key) => str(document.frontmatter[key]));
    return { ...page, document, title, description, tagline, install };
  }),
);

// The index lists every package from its own page's front matter.
const pluginCards: NodeHandler = () =>
  `<div class="cards">${parsed
    .filter((page) => page.npm)
    .map(
      (page) =>
        `<a class="card" href="/${page.slug}/"><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.description)}</span><code>${escapeHtml(page.install.replace(/^pnpm add (comark @comark\/html )?/, "pnpm add "))}</code></a>`,
    )
    .join("")}</div>`;

const github = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const userIcon = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>`;
const botIcon = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M15 13v2M9 13v2"/></svg>`;
const copyIcon = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 8h12v12H8zM16 8V4H4v12h4"/></svg>`;
// Humans install the package with their package manager; agents install the skill from this site.
function installerFor(install: string) {
  const packages = install.replace(/^pnpm add /, "");
  const commands = {
    pnpm: `pnpm add ${packages}`,
    npm: `npm install ${packages}`,
    yarn: `yarn add ${packages}`,
    bun: `bun add ${packages}`,
    agents: `npx skills add ${site}`,
  } satisfies Record<string, string>;
  return `<div class="installer" data-commands='${escapeHtml(JSON.stringify(commands))}'>
<div class="installer-bar"><div class="seg" role="group" aria-label="Audience"><button type="button" data-audience="humans" aria-pressed="true">${userIcon}For humans</button><button type="button" data-audience="agents" aria-pressed="false">${botIcon}For agents</button></div>
<div class="seg installer-pm" role="group" aria-label="Package manager">${["pnpm", "npm", "yarn", "bun"].map((pm, i) => `<button type="button" data-pm="${pm}" aria-pressed="${i === 0}">${pm}</button>`).join("")}</div></div>
<button type="button" class="install" data-copy="${escapeHtml(commands.pnpm)}" aria-label="Copy the install command"><span aria-hidden="true">$</span><code>${escapeHtml(commands.pnpm)}</code><span class="install-hint">${copyIcon}</span></button>
</div>`;
}
const links = (current: string) =>
  pages
    .filter((page) => page.npm)
    .map(
      (page) =>
        `<a class="link"${page.slug === current ? ' aria-current="page"' : ""} href="/${page.slug}/">${page.slug}</a>`,
    )
    .join("");
const npmx = `<svg viewBox="0 0 153 153" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M17.6 107.2h24.1v23.7h-24zM119.8.8 116.2 11 69.9 142l-3.6 10.2h15.5l3.6-10.2 11.7-33.2L135.4.8z"/></svg>`;
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
for (const box of document.querySelectorAll(".installer")) {
  const commands = JSON.parse(box.dataset.commands); const field = box.querySelector(".install"); let audience = "humans", pm = "pnpm";
  const update = () => { const cmd = commands[audience === "agents" ? "agents" : pm]; field.dataset.copy = cmd; field.querySelector("code").textContent = cmd; box.querySelector(".installer-pm").hidden = audience === "agents"; for (const b of box.querySelectorAll("[data-audience]")) b.setAttribute("aria-pressed", b.dataset.audience === audience); for (const b of box.querySelectorAll("[data-pm]")) b.setAttribute("aria-pressed", b.dataset.pm === pm) };
  box.addEventListener("click", e => { const b = e.target.closest("[data-audience],[data-pm]"); if (!b) return; if (b.dataset.audience) audience = b.dataset.audience; if (b.dataset.pm) pm = b.dataset.pm; update() });
  field.addEventListener("click", async () => { await navigator.clipboard.writeText(field.dataset.copy); field.classList.add("copied"); setTimeout(() => field.classList.remove("copied"), 1200) });
}
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
await cp(
  new URL("../node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2", root),
  new URL("fonts/Caveat-Variable.woff2", dist),
);

// The package's agent skill, served for Agent Skills Discovery: v0.2 with a digest, and v0.1, which `npx skills add` reads.
const skill = await readFile(
  new URL("../packages/annotate/skills/comark-annotate/SKILL.md", root),
  "utf8",
);
const skillMeta = (await parseMarkdown(skill)).frontmatter;
const [skillName, skillDescription] = [str(skillMeta.name), str(skillMeta.description)];
for (const base of ["agent-skills", "skills"]) {
  await mkdir(new URL(`.well-known/${base}/${skillName}/`, dist), { recursive: true });
  await writeFile(new URL(`.well-known/${base}/${skillName}/SKILL.md`, dist), skill);
}
await writeFile(
  new URL(".well-known/agent-skills/index.json", dist),
  JSON.stringify({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: skillName,
        type: "skill-md",
        description: skillDescription,
        url: `/.well-known/agent-skills/${skillName}/SKILL.md`,
        digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
      },
    ],
  }),
);
await writeFile(
  new URL(".well-known/skills/index.json", dist),
  JSON.stringify({
    skills: [{ name: skillName, description: skillDescription, files: ["SKILL.md"] }],
  }),
);

for (const page of parsed) {
  const out = new URL(page.slug ? `${page.slug}/` : "", dist);
  await mkdir(out, { recursive: true });
  await writeFile(
    new URL("index.html", out),
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title} · ${page.description}</title>
<meta name="description" content="${escapeHtml(page.tagline)}">\n<link rel="canonical" href="${site}/${page.slug ? `${page.slug}/` : ""}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${await readFile(new URL("style.css", root), "utf8")}</style>
</head>
<body>
<header class="top">
<a class="name" href="/">${logo}comark plugins</a>
<nav>${links(page.slug)}${page.npm ? `<a class="icon" href="https://npmx.dev/package/${page.npm}" aria-label="${page.npm} on npmx" title="npmx">${npmx}</a>` : ""}<a class="icon" href="https://github.com/onmax/comark-plugins" aria-label="comark-plugins on GitHub" title="GitHub">${github}</a></nav>
</header>
<div class="layout">
<aside class="sidebar"><nav aria-label="On this page"><a class="nav-h2" href="#">Introduction</a>${nav(page.document)}</nav></aside>
<div class="content">
<div class="hero enter"><h1>${page.title}</h1><p>${escapeHtml(page.tagline)}</p>
${page.install ? installerFor(page.install) : ""}</div>
<main class="enter" style="--i:1">${await renderHtmlFromDocument(page.document, { components: { ...components, example, tabs, plugins: pluginCards } })}</main>
<footer><span>Built on <a href="https://comark.dev">Comark</a> by the <a href="https://github.com/comarkdown">Comark team</a>. Marks from <a href="https://annotationkit.vercel.app">AnnotationKit</a>.</span><span>Made by <a href="https://onmax.me">Maxi García</a></span></footer>
</div>
</div>
<script>${script.trim()}</script>
</body>
</html>
`,
  );
  console.log(`docs/dist/${page.slug ? `${page.slug}/` : ""}index.html written`);
}

// Renders docs/pages with the plugins themselves into docs/dist, a static site served by Cloudflare at comark.onmax.me.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { renderHtmlFromDocument } from "@comark/html";
import shiki from "@comark/html/plugins/shiki";
import type { ElementNode, Node, NodeHandler } from "comark";
import { parseMarkdown } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";
import { build } from "vite";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import githubCallouts, {
  components as githubCalloutsComponents,
} from "../packages/github-callouts/src/html.ts";
import include from "../packages/include/src/index.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import { highlight } from "./highlight.ts";
import { previewDocument } from "./preview.ts";

const root = new URL("./", import.meta.url);
const dist = new URL("dist/", root);
const fonts = new URL("../node_modules/geist/dist/fonts/", root);
const site = "https://comark.onmax.me";
// The plugins that run in a browser, the playground's set.
const browserPlugins = () => [
  annotate(),
  carousel(),
  charts(),
  embed(),
  githubCallouts(),
  tabs(),
  zoom(),
];
// Every page sits in pages/, so includes resolve from there.
const contentPlugins = () => [
  include({ root: fileURLToPath(new URL("pages/", root)) }),
  ...browserPlugins(),
];
const plugins = [...contentPlugins(), shiki({ themes: { light, dark } })];
const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...chartsComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
  ...tabsComponents,
  ...zoomComponents,
};

// Lucide's icons, by name, and annotate's own: a hand-drawn loop like its marks.
const icons = {
  "book-open": `<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  "flask-conical": `<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>`,
  "scribble-loop": `<path d="M7 5.5C11.5 2.8 20.3 3.4 21.5 8.6 22.8 14.3 16.5 20 9.6 20.4 4.4 20.7 1.5 17.6 2.6 13.6 3.6 10 8.3 7.3 13.6 7.2"/>`,
  "chart-column": `<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>`,
  "tv-minimal-play": `<path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z"/><path d="M7 21h10"/><rect width="20" height="14" x="2" y="3" rx="2"/>`,
  "message-square-warning": `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v2"/><path d="M12 13h.01"/>`,
  "zoom-in": `<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>`,
  "gallery-horizontal-end": `<path d="M2 7v10"/><path d="M6 5v14"/><rect width="12" height="18" x="10" y="3" rx="2"/>`,
  "panels-top-left": `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>`,
  "file-input": `<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/>`,
  "list-checks": `<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>`,
  "arrow-left": `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`,
  "arrow-right": `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
};
type IconName = keyof typeof icons;
const icon = (name: IconName, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

// The rail, in order: the docs, the playground, then one section per package. A package whose folder isn't in
// pages/ yet, such as one still on a branch, is left out.
const packages = (
  [
    { slug: "annotate", group: "Review blocks", icon: "scribble-loop" },
    { slug: "charts", group: "Review blocks", icon: "chart-column" },
    { slug: "embed", group: "Review blocks", icon: "tv-minimal-play" },
    { slug: "github-callouts", group: "Review blocks", icon: "message-square-warning" },
    { slug: "zoom", group: "Page behavior", icon: "zoom-in" },
    { slug: "carousel", group: "Page behavior", icon: "gallery-horizontal-end" },
    { slug: "tabs", group: "Page behavior", icon: "panels-top-left" },
    { slug: "include", group: "Authoring tools", icon: "file-input" },
    { slug: "lint", group: "Authoring tools", icon: "list-checks" },
  ] satisfies { slug: string; group: string; icon: IconName }[]
).filter((pkg) => existsSync(new URL(`pages/${pkg.slug}/index.md`, root)));
const fileOf = (slug: string) =>
  existsSync(new URL(`pages/${slug || "index"}.md`, root))
    ? `${slug || "index"}.md`
    : `${slug}/index.md`;
type Section = {
  slug: string;
  label: string;
  group: string;
  icon: IconName;
  npm?: string;
  lists: { title?: string; slugs: string[] }[];
};
const sections: Section[] = [
  {
    slug: "",
    label: "Docs",
    group: "Comark plugins",
    icon: "book-open",
    lists: [
      { slugs: [""] },
      {
        title: "Guides",
        slugs: ["guide/renderers", "guide/theming", "guide/validation", "guide/agents"],
      },
      { title: "Recipes", slugs: ["recipes/review", "recipes/zoom", "recipes/carousel"] },
      { title: "Compared", slugs: ["compare/charts"] },
    ],
  },
  // Its column lists the presets, which come from the pages' examples.
  { slug: "play", label: "Playground", group: "Comark plugins", icon: "flask-conical", lists: [] },
  ...packages.map((pkg) => ({
    ...pkg,
    label: pkg.slug,
    npm: `comark-${pkg.slug}`,
    // A package's pages, in this order when it has them.
    lists: [
      {
        slugs: ["", "getting-started", "components", "syntax", "guides", "vite-doctor"]
          .map((page) => (page ? `${pkg.slug}/${page}` : pkg.slug))
          .filter((slug) => existsSync(new URL(`pages/${fileOf(slug)}`, root))),
      },
    ],
  })),
];

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const str = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);
const isPre = (node: Node): node is ElementNode => isElement(node) && node[0] === "pre";
const href = (slug: string) => `/${slug}${slug ? "/" : ""}`;
// An include reads files, so the playground can't run it.
const playable = (source: string) => !/^:+include\b/m.test(source);
const playLink = (source: string) => `/play/#md=${deflateRawSync(source).toString("base64url")}`;

// An example shows the Markdown in its code block twice: rendered, and as source.
const example: NodeHandler = async ([, attrs, ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error(`Example "${str(attrs.label)}" needs a fenced code block.`);
  const source = textContent(pre);
  // Highlighted like the page, so a diff in an example keeps its colors.
  const preview = await parseMarkdown(source, {
    plugins: [...contentPlugins(), shiki({ themes: { light, dark } })],
  });
  if (preview.meta.issues.length)
    throw new Error(`Example "${str(attrs.label)}":\n${preview.meta.issues.join("\n")}`);
  const play = playable(source)
    ? `<a class="example-play" href="${escapeHtml(playLink(source))}">${icon("flask-conical", 13)}Playground</a>`
    : "";
  return (
    `<div class="example"><div class="example-bar">${play}<div class="seg" role="group" aria-label="View">` +
    `<button type="button" data-view="preview" aria-pressed="true">Preview</button><button type="button" data-view="code" aria-pressed="false">Code</button></div></div>` +
    `<div class="example-body"><div class="example-preview">${await state.flow(["div", {}, ...preview.nodes], state)}</div>` +
    `<div class="example-code" hidden>${await state.one(pre, state)}</div></div></div>`
  );
};

// The examples at the top of each page. Not comark-tabs: each example's Preview/Code switch shares the tab row.
const examples: NodeHandler = async ([, , ...children], state) => {
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
  return `<div class="examples"><div class="tablist" role="tablist">${labels.join("")}</div>${bodies.join("")}</div>`;
};

// A comparison table, which the styles lay out: a row with only its first cell filled heads a group, and italics in
// a first cell describe the row.
const matrix: NodeHandler = async ([, , ...children], state) =>
  `<div class="matrix">${(await Promise.all(children.map((child) => state.one(child, state)))).join("")}</div>`;

// The index's window: its Markdown, typed out a line at a time, then the page the plugins render from it. Each line
// is revealed in as many steps as it has characters, all in about two seconds; the script plays it and switches tabs.
const hero: NodeHandler = async ([, , ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error("The hero needs a fenced code block.");
  const source = textContent(pre).trimEnd();
  const page = await parseMarkdown(source, { plugins: contentPlugins() });
  if (page.meta.issues.length) throw new Error(`The hero:\n${page.meta.issues.join("\n")}`);
  const lines = source.split("\n");
  const perChar = Math.min(16, 2200 / lines.join("").length);
  let at = 0;
  let line = 0;
  const code = highlight(source)
    .replace(/<\/span>\n<span class="line">/g, '</span><span class="line">')
    .replace(/<span class="line">/g, () => {
      const length = lines[line++]?.length ?? 0;
      const style = `--n:${Math.max(length, 1)};--t:${Math.round(length * perChar)}ms;--at:${Math.round(at)}ms`;
      at += length * perChar + 40;
      return `<span class="line" style="${style}">`;
    });
  return (
    `<div class="window" style="--typed:${Math.round(at)}ms"><div class="window-bar"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>` +
    `<div class="window-tabs" role="tablist" aria-label="The example"><button type="button" role="tab" id="window-source-tab" aria-controls="window-source" aria-selected="true">review.md</button>` +
    `<button type="button" role="tab" id="window-page-tab" aria-controls="window-page" aria-selected="false" tabindex="-1">Rendered</button></div>` +
    `<a class="window-play" href="${escapeHtml(playLink(source))}">${icon("flask-conical", 13)}<span>Open in playground</span></a></div>` +
    `<div class="window-body"><div class="window-source" id="window-source" role="tabpanel" aria-labelledby="window-source-tab" data-active>${code}</div>` +
    `<div class="window-page" id="window-page" role="tabpanel" aria-labelledby="window-page-tab" inert>${await state.flow(["div", {}, ...page.nodes], state)}</div></div></div>`
  );
};

const toc = (document: { nodes: Node[] }) =>
  document.nodes
    .filter(isElement)
    .filter(([tag]) => tag === "h2" || tag === "h3")
    .map(
      ([tag, attrs, ...children]) =>
        `<a class="nav-${tag}" href="#${str(attrs.id)}">${escapeHtml(textContent([tag, attrs, ...children]))}</a>`,
    )
    .join("");

const parsed = await Promise.all(
  sections.flatMap((section) =>
    section.lists.flatMap((list) =>
      list.slugs.map(async (slug) => {
        const file = fileOf(slug);
        const document = await parseMarkdown(
          await readFile(new URL(`pages/${file}`, root), "utf8"),
          { plugins },
        );
        if (document.meta.issues.length)
          throw new Error(`docs/pages/${file}:\n${document.meta.issues.join("\n")}`);
        const [title, description, tagline, install, headline] = [
          "title",
          "description",
          "tagline",
          "install",
          "headline",
        ].map((key) => str(document.frontmatter[key]));
        const skill =
          section.npm &&
          existsSync(new URL(`../packages/${section.slug}/skills/${section.npm}/SKILL.md`, root))
            ? section.npm
            : "";
        return {
          slug,
          section,
          document,
          title,
          description,
          tagline: tagline || description,
          install,
          headline,
          skill,
          label: slug === section.slug ? "Overview" : title,
          toc: toc(document),
        };
      }),
    ),
  ),
);
type Page = (typeof parsed)[number];
const pagesOf = (section: Section) =>
  section.lists.map((list) => ({
    ...list,
    pages: list.slugs.flatMap((slug) => parsed.filter((page) => page.slug === slug)),
  }));

// The playground's presets: every page's top examples, under the section they come from.
const presets = parsed.flatMap((page) =>
  page.document.nodes
    .filter(isElement)
    .filter(([tag]) => tag === "examples")
    .flatMap(([, , ...panels]) => panels.filter(isElement))
    .map(([, attrs, ...children]) => ({
      id: `${page.section.slug || "docs"}-${str(attrs.label)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      label: str(attrs.label),
      group: page.section.label,
      npm: page.section.npm ?? "",
      source: textContent(children.find(isPre) ?? ["pre", {}]),
    }))
    .filter((preset) => playable(preset.source)),
);
// A small still of each preset for the playground's column: no scripts, and a gray box for each embedded player,
// so the column loads nothing but the pages' own images. The plugins' styles go in the page once.
const thumbnailStyles = new Set<string>();
const thumbnails = new Map(
  await Promise.all(
    presets.map(async (preset) => {
      const document = await parseMarkdown(preset.source, { plugins: browserPlugins() });
      const html = (await renderHtmlFromDocument(document, { components }))
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (style) => (thumbnailStyles.add(style), ""))
        .replace(/<script>[\s\S]*?<\/script>/g, "")
        .replace(
          /<iframe\b[^>]*><\/iframe>/g,
          `<span class="preset-player">${icon("tv-minimal-play", 56)}</span>`,
        )
        .replace(/\s(id|for|aria-controls|aria-labelledby)="[^"]*"/g, "")
        .replace(/<img\b/g, '<img loading="lazy"');
      return [preset.id, html] as const;
    }),
  ),
);

// The index lists a group's packages as cards, or a list of the docs' pages as rows, from their own front matter. A
// card's link covers it, and its copy button sits above the link.
const cards: NodeHandler = ([, attrs]) => {
  const group = str(attrs.group);
  const found = sections
    .filter((section) => section.group === group)
    .flatMap((section) => parsed.filter((page) => page.slug === section.slug));
  if (!found.length) {
    const pages = pagesOf(sections[0]).find((list) => list.title === group)?.pages ?? [];
    return `<div class="rows">${pages
      .map(
        (page) =>
          `<a class="row" href="${href(page.slug)}"><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.description)}</span>${icon("arrow-right", 14)}</a>`,
      )
      .join("")}</div>`;
  }
  return `<div class="cards">${found
    .map((page) => {
      const install = page.install.replace(/^pnpm add (comark @comark\/html )?/, "pnpm add ");
      return (
        `<div class="card"><span class="card-icon">${icon(page.section.icon)}</span>` +
        `<a class="card-link" href="${href(page.slug)}">${escapeHtml(page.title)}</a><p>${escapeHtml(page.description)}</p>` +
        `<div class="card-install"><code title="${escapeHtml(install)}">${escapeHtml(install)}</code>` +
        `<button type="button" class="card-copy" data-copy="${escapeHtml(install)}" aria-label="Copy ${escapeHtml(install)}">${copyIcon}${checkIcon}</button></div></div>`
      );
    })
    .join("")}</div>`;
};

const github = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const userIcon = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>`;
const botIcon = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M15 13v2M9 13v2"/></svg>`;
const copyIcon = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 8h12v12H8zM16 8V4H4v12h4"/></svg>`;
const checkIcon = `<svg class="check" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5"/></svg>`;
// Humans install the package with their package manager; agents install the skill from this site, the package's
// own when it has one.
function installerFor(install: string, skill: string) {
  const packages = install.replace(/^pnpm add /, "");
  const commands = {
    pnpm: `pnpm add ${packages}`,
    npm: `npm install ${packages}`,
    yarn: `yarn add ${packages}`,
    bun: `bun add ${packages}`,
    agents: `npx skills add ${site}${skill ? ` --skill ${skill}` : ""}`,
  } satisfies Record<string, string>;
  return `<div class="installer" data-commands='${escapeHtml(JSON.stringify(commands))}'>
<div class="installer-bar"><div class="seg" role="group" aria-label="Audience"><button type="button" data-audience="humans" aria-pressed="true">${userIcon}For humans</button><button type="button" data-audience="agents" aria-pressed="false">${botIcon}For agents</button></div>
<div class="seg installer-pm" role="group" aria-label="Package manager">${["pnpm", "npm", "yarn", "bun"].map((pm, i) => `<button type="button" data-pm="${pm}" aria-pressed="${i === 0}">${pm}</button>`).join("")}</div></div>
<button type="button" class="install" data-copy="${escapeHtml(commands.pnpm)}" aria-label="Copy the install command"><span aria-hidden="true">$</span><code>${escapeHtml(commands.pnpm)}</code><span class="install-hint">${copyIcon}${checkIcon}</span></button>
</div>`;
}

// The first column: one icon per section. Hovering or focusing it widens it over the second column to show every
// section's name, as on vitehub.dev. The current section's is marked.
const rail = (current: Section) =>
  `<nav class="rail" aria-label="Sections">${sections
    .map(
      (section, i) =>
        `${i && section.group !== sections[i - 1].group ? "<hr>" : ""}<a href="${href(section.slug)}"${section === current ? ' aria-current="true"' : ""}>${icon(section.icon)}<span class="rail-label">${escapeHtml(section.label)}</span></a>`,
    )
    .join("")}</nav>`;
// The second column: the current section's pages, or the playground's presets.
const column = (section: Section, current: string) => {
  const lists =
    section.slug === "play"
      ? [...new Set(presets.map((preset) => preset.group))].map((group) => ({
          title: group,
          icon: sections.find((section) => section.label === group)?.icon,
          links: [
            `<div class="presets">${presets
              .filter((preset) => preset.group === group)
              .map(
                (preset) =>
                  `<div class="preset"><div class="preset-thumb" aria-hidden="true" inert><div class="preset-page">${thumbnails.get(preset.id) ?? ""}</div></div><a data-preset="${preset.id}" href="#preset=${preset.id}">${escapeHtml(preset.label)}</a></div>`,
              )
              .join("")}</div>`,
          ],
        }))
      : pagesOf(section).map((list) => ({
          title: list.title,
          icon: undefined,
          links: list.pages.map(
            (page) =>
              `<a${page.slug === current ? ' aria-current="page"' : ""} href="${href(page.slug)}">${escapeHtml(page.label)}</a>`,
          ),
        }));
  // A package with examples opens its first one in the playground.
  const preset = presets.find((preset) => preset.group === section.label);
  return `<nav class="pages" aria-label="${escapeHtml(section.label)}"><p class="pages-title">${escapeHtml(section.npm ?? section.label)}</p>${lists
    .map(
      (list) =>
        `${list.title ? `<p class="nav-group">${list.icon ? icon(list.icon, 14) : ""}${escapeHtml(list.title)}</p>` : ""}${list.links.join("")}`,
    )
    .join(
      "",
    )}${section.npm && preset ? `<a class="pages-play" href="/play/#preset=${preset.id}">${icon("flask-conical", 15)}Open in playground</a>` : ""}</nav>`;
};
// Previous and next page in the section.
function pager(page: Page) {
  const list = pagesOf(page.section).flatMap((list) => list.pages);
  const i = list.indexOf(page);
  const [previous, next] = [list[i - 1], list[i + 1]];
  if (!previous && !next) return "";
  const link = (target: Page | undefined, rel: string, arrow: IconName) =>
    target
      ? `<a class="pager-${rel}" rel="${rel}" href="${href(target.slug)}"><small>${rel === "prev" ? "Previous" : "Next"}</small><span>${rel === "prev" ? icon(arrow, 14) : ""}${escapeHtml(target.label)}${rel === "next" ? icon(arrow, 14) : ""}</span></a>`
      : "<span></span>";
  return `<nav class="pager" aria-label="Pages">${link(previous, "prev", "arrow-left")}${link(next, "next", "arrow-right")}</nav>`;
}

const npmx = `<svg viewBox="0 0 153 153" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M17.6 107.2h24.1v23.7h-24zM119.8.8 116.2 11 69.9 142l-3.6 10.2h15.5l3.6-10.2 11.7-33.2L135.4.8z"/></svg>`;
// npmx shows a page's package, or every package of the project on a page about all of them.
const npmxLink = (npm?: string) =>
  `<a class="npmx" href="https://npmx.dev/${npm ? `package/${npm}` : "~onmax_"}" title="${npm ? `${npm} on npmx` : "Every package on npmx"}">${npmx}<span>${npm || "npmx"}</span></a>`;
const logo = `<span class="logo" aria-hidden="true">1</span>`;
const menuIcon = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;

// The example tabs, the Preview/Code switch, copy buttons, and the active sidebar link. Without it the page still reads top to bottom.
const script = `
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
// One indicator per tab row or switch slides to the chosen item. A hidden row measures zero, so it's placed again,
// without sliding, whenever its size changes.
const indicate = (group, selector) => {
  const bar = group.appendChild(Object.assign(document.createElement("span"), { className: "indicator" }));
  bar.setAttribute("aria-hidden", "true");
  const place = () => { const b = group.querySelector(selector); if (b) { bar.style.width = b.offsetWidth + "px"; bar.style.transform = "translateX(" + b.offsetLeft + "px)" } };
  new ResizeObserver(() => {
    bar.dataset.still = ""; place(); requestAnimationFrame(() => delete bar.dataset.still);
    group.toggleAttribute("data-overflow", group.scrollWidth > group.clientWidth + 1);
  }).observe(group);
  group.dataset.indicator = "";
  return place;
};
const reveal = el => { if (!reduce.matches) el.animate({ opacity: [0, 1] }, { duration: 200, easing: "ease-out" }) };
for (const t of document.querySelectorAll(".examples")) {
  const row = t.querySelector(".tablist"), place = indicate(row, "[aria-selected=true]");
  row.addEventListener("click", e => {
    const b = e.target.closest("[role=tab]"); if (!b || b.getAttribute("aria-selected") === "true") return;
    for (const x of t.querySelectorAll(":scope > .tablist > [role=tab]")) x.setAttribute("aria-selected", x === b);
    for (const p of t.querySelectorAll(":scope > [role=tabpanel]")) { p.hidden = p.dataset.tab !== b.dataset.tab; if (!p.hidden) reveal(p) }
    place();
  });
}
for (const seg of document.querySelectorAll(".seg")) {
  const place = indicate(seg, "[aria-pressed=true]");
  seg.addEventListener("click", () => requestAnimationFrame(place));
}
for (const ex of document.querySelectorAll(".example")) ex.querySelector(".seg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || b.getAttribute("aria-pressed") === "true") return;
  for (const x of ex.querySelectorAll(".seg button")) x.setAttribute("aria-pressed", x === b);
  for (const view of ["preview", "code"]) { const p = ex.querySelector(".example-" + view); p.hidden = b.dataset.view !== view; if (!p.hidden) reveal(p) }
});
for (const box of document.querySelectorAll(".installer")) {
  const commands = JSON.parse(box.dataset.commands); const field = box.querySelector(".install"); let audience = "humans", pm = "pnpm";
  const update = () => { const cmd = commands[audience === "agents" ? "agents" : pm]; field.dataset.copy = cmd; field.querySelector("code").textContent = cmd; box.querySelector(".installer-pm").hidden = audience === "agents"; for (const b of box.querySelectorAll("[data-audience]")) b.setAttribute("aria-pressed", b.dataset.audience === audience); for (const b of box.querySelectorAll("[data-pm]")) b.setAttribute("aria-pressed", b.dataset.pm === pm) };
  box.addEventListener("click", e => { const b = e.target.closest("[data-audience],[data-pm]"); if (!b) return; if (b.dataset.audience) audience = b.dataset.audience; if (b.dataset.pm) pm = b.dataset.pm; update() });
  field.addEventListener("click", async () => { await navigator.clipboard.writeText(field.dataset.copy); field.classList.add("copied"); setTimeout(() => field.classList.remove("copied"), 1200) });
}
for (const b of document.querySelectorAll(".card-copy")) b.addEventListener("click", async () => {
  await navigator.clipboard.writeText(b.dataset.copy); b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200);
});
// The index's window types its Markdown once, then wipes to the rendered page. A tab chosen first stops it.
for (const win of document.querySelectorAll(".window")) {
  const tabs = [...win.querySelectorAll("[role=tab]")], panels = [...win.querySelectorAll("[role=tabpanel]")];
  const place = indicate(win.querySelector(".window-tabs"), "[aria-selected=true]");
  let timer;
  const show = (i, wipe) => {
    clearTimeout(timer); delete win.dataset.typing;
    if (tabs[i].getAttribute("aria-selected") === "true") return;
    for (const [j, t] of tabs.entries()) { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1 }
    const [from, to] = [panels[1 - i], panels[i]];
    to.toggleAttribute("data-active", true); to.inert = false; from.inert = true;
    const done = () => from.removeAttribute("data-active");
    if (wipe && !reduce.matches) to.animate({ clipPath: ["inset(0 100% 0 0)", "inset(0)"] }, { duration: 700, easing: "cubic-bezier(0.77, 0, 0.175, 1)" }).finished.then(done);
    else done();
    place();
  };
  win.querySelector(".window-tabs").addEventListener("click", e => { const t = e.target.closest("[role=tab]"); if (t) show(tabs.indexOf(t), true) });
  win.querySelector(".window-tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = tabs.indexOf(e.target) === 0 ? 1 : 0; show(i, true); tabs[i].focus();
  });
  if (reduce.matches) show(1);
  else { win.dataset.typing = ""; timer = setTimeout(() => show(1, true), parseFloat(getComputedStyle(win).getPropertyValue("--typed")) + 900) }
}
for (const pre of document.querySelectorAll("main pre:not(.window pre)")) {
  const b = document.createElement("button"); b.className = "copy"; b.type = "button"; b.textContent = "Copy";
  b.onclick = async () => { await navigator.clipboard.writeText(pre.querySelector("code").innerText.trimEnd()); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1500) };
  pre.append(b);
}
const links = [...document.querySelectorAll(".toc a")];
const spy = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) for (const a of links) a.toggleAttribute("data-active", a.hash === "#" + e.target.id);
}, { rootMargin: "0px 0px -70% 0px" });
for (const h of document.querySelectorAll("main h2[id], main h3[id]")) spy.observe(h);
`;

// Search over every page and its headings, from /search.json, fetched the first time it's needed. Without the
// script the button stays hidden.
const searchScript = `
// Escape folds the widened rail back without moving focus; it widens again once the pointer or focus leaves it.
for (const rail of document.querySelectorAll(".sidebar .rail")) {
  rail.addEventListener("keydown", e => { if (e.key === "Escape") rail.dataset.dismissed = "" });
  rail.addEventListener("focusout", e => { if (!rail.contains(e.relatedTarget)) delete rail.dataset.dismissed });
  rail.addEventListener("pointerleave", () => delete rail.dataset.dismissed);
}
const open = document.querySelector(".search-open"), dialog = document.querySelector("dialog.search");
const input = dialog.querySelector("input"), list = dialog.querySelector("[role=listbox]"), empty = dialog.querySelector(".search-empty");
let entries, results = [], active = 0;
const load = () => entries ??= fetch("/search.json").then(r => r.json());
open.hidden = false;
if (/Mac|iP(hone|ad)/.test(navigator.platform)) open.querySelector("kbd").textContent = "⌘K";
const select = i => {
  active = i;
  for (const [j, a] of [...list.children].entries()) a.setAttribute("aria-selected", j === i);
  const a = list.children[i];
  if (a) { input.setAttribute("aria-activedescendant", a.id); a.scrollIntoView({ block: "nearest" }) } else input.removeAttribute("aria-activedescendant");
};
const update = async () => {
  const all = await load(), q = input.value.trim().toLowerCase(), words = q.split(/\\s+/).filter(Boolean);
  const rank = e => [e.t.toLowerCase().startsWith(q) ? 0 : e.t.toLowerCase().includes(q) ? 1 : 2, e.k === "page" ? 0 : 1];
  results = (q ? all.filter(e => words.every(w => (e.t + " " + e.p + " " + (e.d ?? "")).toLowerCase().includes(w)))
    .map((e, i) => [...rank(e), i, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).map(x => x[3])
    : all.filter(e => e.k === "page")).slice(0, 12);
  list.replaceChildren(...results.map((e, i) => {
    const a = Object.assign(document.createElement("a"), { id: "search-" + i, href: e.h, tabIndex: -1 });
    a.setAttribute("role", "option");
    a.append(Object.assign(document.createElement("small"), { textContent: e.p }), Object.assign(document.createElement("span"), { textContent: e.t }));
    return a;
  }));
  empty.hidden = results.length > 0;
  input.setAttribute("aria-expanded", String(dialog.open));
  // Keep the combobox state synchronized when the dialog closes without another search.
  select(0);
};
const show = () => { dialog.showModal(); input.select(); update() };
open.addEventListener("click", show);
dialog.addEventListener("close", () => input.setAttribute("aria-expanded", "false"));
open.addEventListener("pointerenter", load, { once: true });
addEventListener("keydown", e => {
  const typing = e.target.closest("input, textarea, select, [contenteditable]");
  if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); if (dialog.open) dialog.close(); else show() }
});
input.addEventListener("input", update);
input.addEventListener("keydown", e => {
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && results.length) { e.preventDefault(); select((active + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length) }
  else if (e.key === "Enter" && results[active]) { e.preventDefault(); dialog.close(); location.href = results[active].h }
});
list.addEventListener("pointermove", e => { const a = e.target.closest("[role=option]"); if (a) select([...list.children].indexOf(a)) });
list.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close() });
`;
// One entry per page and per heading: its title, where it sits, and its link.
const searchIndex = [
  ...parsed.flatMap((page) => {
    const where =
      page.section.slug === page.slug
        ? page.section.label
        : `${page.section.label} › ${page.label}`;
    const title =
      page.section.npm && page.slug === page.section.slug ? page.section.npm : page.title;
    return [
      {
        k: "page",
        t: title,
        p: page.section.npm ? page.section.label : "Docs",
        h: href(page.slug),
        d: page.description,
      },
      ...page.document.nodes
        .filter(isElement)
        .filter(([tag]) => tag === "h2" || tag === "h3")
        .map((heading) => ({
          k: "heading",
          t: textContent(heading),
          p: where,
          h: `${href(page.slug)}#${str(heading[1].id)}`,
        })),
    ];
  }),
  {
    k: "page",
    t: "Playground",
    p: "Docs",
    h: "/play/",
    d: "Edit any example with every plugin and share a link to it.",
  },
];

await rm(dist, { recursive: true, force: true });
await mkdir(new URL("fonts/", dist), { recursive: true });
await cp(new URL("public/", root), dist, { recursive: true });
for (const font of ["geist-sans/Geist-Variable.woff2", "geist-mono/GeistMono-Variable.woff2"])
  await cp(new URL(font, fonts), new URL(`fonts/${font.split("/")[1]}`, dist));
await cp(
  new URL("../node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2", root),
  new URL("fonts/Caveat-Variable.woff2", dist),
);
const style = await readFile(new URL("style.css", root), "utf8");
await writeFile(new URL("search.json", dist), JSON.stringify(searchIndex));
// Pages inline the styles; the playground's preview loads them.
await writeFile(new URL("style.css", dist), style);
await build({
  configFile: false,
  logLevel: "warn",
  build: {
    outDir: fileURLToPath(new URL("play/", dist)),
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL("play.ts", root)), formats: ["es"], fileName: "play" },
  },
});

// The packages' agent skills, served for Agent Skills Discovery: v0.2 with a digest, and v0.1, which `npx skills add` reads.
const skills = await Promise.all(
  ["annotate/skills/comark-annotate", "charts/skills/comark-charts"].map(async (folder) => {
    const text = await readFile(new URL(`../packages/${folder}/SKILL.md`, root), "utf8");
    const meta = (await parseMarkdown(text)).frontmatter;
    return { text, name: str(meta.name), description: str(meta.description) };
  }),
);
for (const skill of skills)
  for (const base of ["agent-skills", "skills"]) {
    await mkdir(new URL(`.well-known/${base}/${skill.name}/`, dist), { recursive: true });
    await writeFile(new URL(`.well-known/${base}/${skill.name}/SKILL.md`, dist), skill.text);
  }
await writeFile(
  new URL(".well-known/agent-skills/index.json", dist),
  JSON.stringify({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: skills.map((skill) => ({
      name: skill.name,
      type: "skill-md",
      description: skill.description,
      url: `/.well-known/agent-skills/${skill.name}/SKILL.md`,
      digest: `sha256:${createHash("sha256").update(skill.text).digest("hex")}`,
    })),
  }),
);
await writeFile(
  new URL(".well-known/skills/index.json", dist),
  JSON.stringify({
    skills: skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      files: ["SKILL.md"],
    })),
  }),
);

// The page around the content: header, rail, the section's column, and a menu that holds both on narrow screens.
function shell(options: {
  slug: string;
  section: Section;
  title: string;
  description: string;
  head?: string;
  body: string;
  // The package the npmx link opens; the section's by default.
  npm?: string;
}) {
  const { slug, section } = options;
  const npm = options.npm ?? section.npm;
  const nav = rail(section) + column(section, slug);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">\n<link rel="canonical" href="${site}${href(slug)}">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${style}</style>${options.head ?? ""}
</head>
<body>
<header class="top">
<a class="name" href="/">${logo}comark plugins</a>
<button type="button" class="search-open" aria-haspopup="dialog" hidden>${icon("search", 15)}<span>Search docs</span><kbd>Ctrl K</kbd></button>
<div class="top-end">
<nav>${npmxLink(npm)}<a class="icon" href="https://github.com/onmax/comark-plugins" aria-label="comark-plugins on GitHub" title="GitHub">${github}</a></nav>
<details class="menu"><summary aria-label="Menu" title="Menu">${menuIcon}</summary><div class="menu-panel">${nav}</div></details>
</div>
</header>
<dialog class="search" aria-label="Search the docs">
<div class="search-field">${icon("search", 16)}<input type="text" enterkeyhint="search" role="combobox" aria-label="Search the docs" aria-controls="search-results" aria-expanded="false" aria-autocomplete="list" placeholder="Search the docs" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>
<div id="search-results" class="search-results" role="listbox" aria-label="Results"></div>
<p class="search-empty" role="status" hidden>No page or heading matches.</p>
</dialog>
<div class="layout">
<aside class="sidebar">${nav}</aside>
${options.body}
</div>
<script>${searchScript.trim()}</script>
</body>
</html>
`;
}

for (const page of parsed) {
  const out = new URL(page.slug ? `${page.slug}/` : "", dist);
  const { npm } = page.section;
  const subpage = npm && page.slug !== page.section.slug;
  await mkdir(out, { recursive: true });
  await writeFile(
    new URL("index.html", out),
    shell({
      slug: page.slug,
      section: page.section,
      title: subpage ? `${page.title} · ${npm}` : `${page.title} · ${page.description}`,
      description: page.tagline,
      body: `<div class="page">
<div class="content">
<div class="hero enter">${subpage ? `<p class="eyebrow mono">${npm}</p>` : ""}${page.headline ? `<h1 class="headline"><span class="hash" aria-hidden="true">#</span>${escapeHtml(page.headline)}</h1>` : `<h1>${escapeHtml(page.title)}</h1>`}<p>${escapeHtml(page.tagline)}</p>
${page.install ? installerFor(page.install, page.skill) : ""}${page.slug ? "" : `<div class="actions"><a class="button primary" href="/play/">${icon("flask-conical", 15)}Open the playground</a><a class="button" href="/guide/renderers/">Read the guides${icon("arrow-right", 15)}</a></div>`}</div>
<main class="enter" style="--i:1">${(await renderHtmlFromDocument(page.document, { components: { ...components, example, examples, cards, matrix, hero } })).replace(/<table>[\s\S]*?<\/table>/g, (table) => `<div class="table-scroll">${table}</div>`)}</main>
${pager(page)}
<footer><span>Built on <a href="https://comark.dev">Comark</a> by the <a href="https://github.com/comarkdown">Comark team</a>. Marks from <a href="https://annotationkit.vercel.app">AnnotationKit</a>.</span><span>Made by <a href="https://onmax.me">Maxi García</a></span></footer>
</div>
${page.toc ? `<aside class="toc"><nav aria-label="On this page"><p class="nav-group">On this page</p>${page.toc}</nav></aside>` : ""}
</div>
<script>${script.trim()}</script>`,
    }),
  );
  console.log(`docs/dist/${page.slug ? `${page.slug}/` : ""}index.html written`);
}

// The playground opens on the first preset, rendered here so it shows before the script loads.
const playSection = sections.find((section) => section.slug === "play");
const first = presets[0];
if (playSection && first) {
  const document = await parseMarkdown(first.source, { plugins: browserPlugins() });
  await mkdir(new URL("play/", dist), { recursive: true });
  await writeFile(
    new URL("play/index.html", dist),
    shell({
      slug: "play",
      section: playSection,
      npm: first.npm,
      title: "Playground · Comark plugins",
      description:
        "Write Comark with every plugin and see it rendered as you type. Start from any example in the docs.",
      head: `\n<link rel="modulepreload" href="/play/play.js">\n${[...thumbnailStyles].join("")}`,
      body: `<div class="play">
<div class="play-editor">
<div class="play-bar"><span>Markdown</span><button type="button" class="play-share">Copy link</button></div>
<div class="play-code"><div class="play-paint" aria-hidden="true">${highlight(`${first.source}\n `)}</div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Markdown">${escapeHtml(first.source)}</textarea></div>
<ul class="play-issues" aria-label="Issues" aria-live="polite" hidden></ul>
</div>
<iframe class="play-preview" title="Preview" srcdoc="${escapeHtml(previewDocument(await renderHtmlFromDocument(document, { components })))}"></iframe>
</div>
<script type="application/json" id="presets">${JSON.stringify(presets.map(({ id, source, npm }) => ({ id, source, npm }))).replaceAll("<", "\\u003c")}</script>
<script type="module" src="/play/play.js"></script>`,
    }),
  );
  console.log("docs/dist/play/index.html written");
}

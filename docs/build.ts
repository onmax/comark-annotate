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
import { icons as lucide } from "@iconify-json/lucide";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";
import { build } from "vite";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import code, { components as codeComponents } from "../packages/code/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import githubCallouts, {
  components as githubCalloutsComponents,
} from "../packages/github-callouts/src/html.ts";
import icon, {
  components as iconComponents,
  createIcons,
  css as iconCss,
  iconHtml,
} from "../packages/icon/src/html.ts";
import include from "../packages/include/src/index.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import { defaultConfig } from "./config.ts";
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
  code(),
  charts(),
  embed(),
  githubCallouts(),
  icon(),
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
  ...codeComponents,
  ...chartsComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
  ...iconComponents,
  ...tabsComponents,
  ...zoomComponents,
};

// The site's own icons, drawn the way `:icon` draws them: Lucide's, and annotate's, a hand-drawn loop like its marks.
const ownIcons = {
  "scribble-loop": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5.5C11.5 2.8 20.3 3.4 21.5 8.6 22.8 14.3 16.5 20 9.6 20.4 4.4 20.7 1.5 17.6 2.6 13.6 3.6 10 8.3 7.3 13.6 7.2"/></svg>`,
};
const lucideNames = [
  "arrow-left",
  "arrow-right",
  "arrow-up-right",
  "book-open",
  "chart-column",
  "file-input",
  "flask-conical",
  "gallery-horizontal-end",
  "list-checks",
  "message-square-warning",
  "panels-top-left",
  "search",
  "shapes",
  "tv-minimal-play",
  "zoom-in",
] as const;
type IconName = (typeof lucideNames)[number] | keyof typeof ownIcons;
const iconId = (name: IconName) => (name in ownIcons ? `site:${name}` : `lucide:${name}`);
const siteIcons = await createIcons({
  collections: { lucide, site: ownIcons },
  fetch: false,
}).resolve([...lucideNames, ...Object.keys(ownIcons)].map((name) => iconId(name as IconName)));
const siteIcon = (name: IconName, size = 18) => {
  const found = siteIcons.get(iconId(name));
  if (!found || "problem" in found) throw new Error(`docs/build.ts: no icon "${name}".`);
  return iconHtml(found).replace('style="', `style="--comark-icon-size:${size}px;`);
};

// The rail, in order: the docs, the playground, then one section per package. A package whose folder isn't in
// pages/ yet, such as one still on a branch, is left out.
const packages = (
  [
    {
      slug: "annotate",
      group: "Review blocks",
      icon: "scribble-loop",
      blurb: "Marks and notes on screenshots",
      credits: 'Marks from <a href="https://annotationkit.vercel.app">AnnotationKit</a>.',
    },
    {
      slug: "charts",
      group: "Review blocks",
      icon: "chart-column",
      blurb: "Charts from a Markdown table",
      credits:
        'Laid out by Microsoft Research\'s <a href="https://github.com/microsoft/flint-chart">Flint</a> on its New York Times theme, and drawn by <a href="https://vega.github.io">Vega</a>.',
    },
    {
      slug: "embed",
      group: "Review blocks",
      icon: "tv-minimal-play",
      blurb: "Videos, audio, and live code",
    },
    {
      slug: "github-callouts",
      group: "Review blocks",
      icon: "message-square-warning",
      blurb: "GitHub's alerts as callouts",
      credits:
        'Syntax from <a href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts">GitHub\'s alerts</a>.',
    },
    {
      slug: "icon",
      group: "Review blocks",
      icon: "shapes",
      blurb: "Iconify icons in Markdown",
    },
    {
      slug: "zoom",
      group: "Page behavior",
      icon: "zoom-in",
      blurb: "Zoom images and any block",
      credits:
        'Modeled on <a href="https://github.com/francoischalifour/medium-zoom">medium-zoom</a>.',
    },
    {
      slug: "carousel",
      group: "Page behavior",
      icon: "gallery-horizontal-end",
      blurb: "Slides of any content",
    },
    {
      slug: "tabs",
      group: "Page behavior",
      icon: "panels-top-left",
      blurb: "Tabs and code groups",
      credits: 'Syntax from <a href="https://ui.nuxt.com">Nuxt UI</a>\'s tabs and code groups.',
    },
    {
      slug: "code",
      group: "Page behavior",
      icon: "panels-top-left",
      blurb: "Copy and wrap buttons on code",
    },
    {
      slug: "include",
      group: "Authoring tools",
      icon: "file-input",
      blurb: "Partials and snippets from files",
      credits: 'Arguments from <a href="https://github.com/unjs/automd">automd</a>.',
    },
    {
      slug: "lint",
      group: "Authoring tools",
      icon: "list-checks",
      blurb: "Catches what Comark forgives",
    },
  ] satisfies { slug: string; group: string; icon: IconName; blurb: string; credits?: string }[]
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
  // What the index's grid says under the package's name.
  blurb?: string;
  // What the footer credits besides Comark, as HTML.
  credits?: string;
  lists: { title?: string; slugs: string[] }[];
};
const sections: Section[] = [
  {
    slug: "",
    label: "Docs",
    group: "Comark plugins",
    icon: "book-open",
    // The index is the landing page, outside every section's column.
    lists: [
      {
        title: "Guides",
        slugs: ["guide/renderers", "guide/theming", "guide/validation", "guide/agents"],
      },
      {
        title: "Recipes",
        slugs: ["recipes/review", "recipes/share", "recipes/zoom", "recipes/carousel"],
      },
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
    ? `<a class="example-play" href="${escapeHtml(playLink(source))}">${siteIcon("flask-conical", 13)}Playground</a>`
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

const matrix: NodeHandler = async ([, , ...children], state) =>
  `<div class="matrix">${(await Promise.all(children.map((child) => state.one(child, state)))).join("")}</div>`;

// The index's window, under the heading and text before it: its Markdown, typed out a line at a time, then the page
// the plugins render from it. Each line is revealed in as many steps as it has characters, all in about two seconds;
// the script plays it once the window scrolls into view, and switches tabs.
const hero: NodeHandler = async ([, , ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error("The hero needs a fenced code block.");
  const intro = children.filter((child) => child !== pre);
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
    `<section class="showcase"><div class="split">${await state.flow(["div", {}, ...intro], state)}</div>` +
    `<div class="window" style="--typed:${Math.round(at)}ms"><div class="window-bar">` +
    `<div class="window-tabs" role="tablist" aria-label="The example"><button type="button" role="tab" id="window-source-tab" aria-controls="window-source" aria-selected="true">review.md</button>` +
    `<button type="button" role="tab" id="window-page-tab" aria-controls="window-page" aria-selected="false" tabindex="-1">Rendered</button></div>` +
    `<a class="window-play" href="${escapeHtml(playLink(source))}">${siteIcon("flask-conical", 13)}<span>Open in playground</span></a></div>` +
    `<div class="window-body"><div class="window-source" id="window-source" role="tabpanel" aria-labelledby="window-source-tab" data-active>${code}</div>` +
    `<div class="window-page" id="window-page" role="tabpanel" aria-labelledby="window-page-tab" inert>${await state.flow(["div", {}, ...page.nodes], state)}</div></div></div></section>`
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

async function parsePage(slug: string, section: Section) {
  const file = fileOf(slug);
  const document = await parseMarkdown(await readFile(new URL(`pages/${file}`, root), "utf8"), {
    plugins,
  });
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
}
const parsed = await Promise.all(
  sections.flatMap((section) =>
    section.lists.flatMap((list) => list.slugs.map((slug) => parsePage(slug, section))),
  ),
);
const landing = await parsePage("", sections[0]);
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
// so the column loads nothing but the pages' own images. A chart drops its data table, so the still is all plot. The
// plugins' styles go in the page once, and the playground scales each still to its card.
const thumbnailStyles = new Set<string>();
const thumbnails = new Map(
  await Promise.all(
    presets.map(async (preset) => {
      const document = await parseMarkdown(preset.source, { plugins: browserPlugins() });
      const html = (await renderHtmlFromDocument(document, { components }))
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (style) => (thumbnailStyles.add(style), ""))
        .replace(/<script>[\s\S]*?<\/script>/g, "")
        .replace(/<details class="cch-data">[\s\S]*?<\/details>/g, "")
        .replace(
          /<iframe\b[^>]*><\/iframe>/g,
          `<span class="preset-player">${siteIcon("tv-minimal-play", 128)}</span>`,
        )
        .replace(/\s(id|for|aria-controls|aria-labelledby)="[^"]*"/g, "")
        .replace(/<img\b/g, '<img loading="lazy"');
      return [preset.id, html] as const;
    }),
  ),
);

// The index's grid: one tile per package, its icon, name, and what it does.
const packageGrid: NodeHandler = () =>
  `<ul class="grid" aria-label="Packages">${sections
    .filter((section) => section.npm)
    .map(
      (section) =>
        `<li><a href="${href(section.slug)}">${siteIcon(section.icon, 24)}<strong>${escapeHtml(section.label)}</strong><span>${escapeHtml(section.blurb ?? "")}</span></a><button type="button" class="grid-copy" data-copy="pnpm add ${escapeHtml(section.npm!)}" aria-label="Copy pnpm add ${escapeHtml(section.npm!)}">${copyIcon}</button></li>`,
    )
    .join("")}</ul>`;

// The index's band for Drop: its pitch, and the list in it as numbered steps beside it.
const drop: NodeHandler = async ([, , ...children], state) => {
  const steps = children.filter((child) => isElement(child) && child[0] === "ol");
  const pitch = children.filter((child) => !steps.includes(child));
  return (
    `<section class="drop"><div class="drop-pitch"><img src="/drop.svg" alt="" width="36" height="36">${await state.flow(["div", {}, ...pitch], state)}` +
    `<div class="actions"><a class="button primary" href="https://drop.vitehub.dev">Try Drop${siteIcon("arrow-up-right", 15)}</a><a class="button" href="/recipes/share/">Read the recipe</a></div></div>` +
    `${(await Promise.all(steps.map((step) => state.one(step, state)))).join("")}</section>`
  );
};

const github = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const starIcon = `<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>`;
// The repository's stars, read once per build. Offline or rate-limited, the button just says GitHub.
const stars = await fetch("https://api.github.com/repos/onmax/comark-plugins", {
  headers: { accept: "application/vnd.github+json" },
  signal: AbortSignal.timeout(5000),
})
  .then((response) =>
    response.ok
      ? // SAFETY: GitHub's repository endpoint answers with an object that has stargazers_count.
        (response.json() as Promise<{ stargazers_count?: number }>)
      : undefined,
  )
  .then((repo) => repo?.stargazers_count)
  .catch(() => undefined);
// GitHub, as on drop.vitehub.dev, with the stars after a divider.
const githubLink = `<a class="github" href="https://github.com/onmax/comark-plugins" aria-label="comark-plugins on GitHub${stars === undefined ? "" : `, ${stars} stars`}">${github}<span class="github-label">GitHub</span>${stars === undefined ? "" : `<span class="github-stars">${starIcon}${new Intl.NumberFormat("en", { notation: "compact" }).format(stars)}</span>`}</a>`;
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
// section's name, as on vitehub.dev. The current section's is marked. Drop sits at the bottom: it renders the
// review documents these plugins make, and it's by the same author.
const rail = (current: Section) =>
  `<nav class="rail" aria-label="Sections">${sections
    .map(
      (section, i) =>
        `${i && section.group !== sections[i - 1].group ? "<hr>" : ""}<a href="${href(section.lists[0]?.slugs[0] ?? section.slug)}"${section === current ? ' aria-current="true"' : ""}>${siteIcon(section.icon)}<span class="rail-label">${escapeHtml(section.label)}</span></a>`,
    )
    .join(
      "",
    )}<a class="rail-drop" href="https://drop.vitehub.dev/?utm_source=comark-plugins&amp;utm_medium=sidebar"><img src="/drop.svg" alt="" width="18" height="18"><span class="rail-label"><strong>Review on Drop</strong><span>Comment on the exact spot</span></span></a></nav>`;
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
        `${list.title ? `<p class="nav-group">${list.icon ? siteIcon(list.icon, 14) : ""}${escapeHtml(list.title)}</p>` : ""}${list.links.join("")}`,
    )
    .join(
      "",
    )}${section.npm && preset ? `<a class="pages-play" href="/play/#preset=${preset.id}">${siteIcon("flask-conical", 15)}Open in playground</a>` : ""}</nav>`;
};
// Previous and next page in the section.
function pager(page: Page) {
  const list = pagesOf(page.section).flatMap((list) => list.pages);
  const i = list.indexOf(page);
  const [previous, next] = [list[i - 1], list[i + 1]];
  if (!previous && !next) return "";
  const link = (target: Page | undefined, rel: string, arrow: IconName) =>
    target
      ? `<a class="pager-${rel}" rel="${rel}" href="${href(target.slug)}"><small>${rel === "prev" ? "Previous" : "Next"}</small><span>${rel === "prev" ? siteIcon(arrow, 14) : ""}${escapeHtml(target.label)}${rel === "next" ? siteIcon(arrow, 14) : ""}</span></a>`
      : "<span></span>";
  return `<nav class="pager" aria-label="Pages">${link(previous, "prev", "arrow-left")}${link(next, "next", "arrow-right")}</nav>`;
}

const npmx = `<svg viewBox="0 0 153 153" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M17.6 107.2h24.1v23.7h-24zM119.8.8 116.2 11 69.9 142l-3.6 10.2h15.5l3.6-10.2 11.7-33.2L135.4.8z"/></svg>`;
// npmx shows a page's package, or every package of the project on a page about all of them.
const npmxLink = (npm?: string) =>
  `<a class="npmx" href="https://npmx.dev/${npm ? `package/${npm}` : "~onmax_"}" title="${npm ? `${npm} on npmx` : "Every package on npmx"}">${npmx}<span>${npm || "npmx"}</span></a>`;
// Markdown's # in a hand-drawn loop, the mark comark-annotate draws around what a reviewer should look at.
const logo = `<svg class="logo" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="currentColor" stroke-width="2.6" d="M13.6 9.5 11.8 22.5M20.2 9.5 18.4 22.5M9.6 13.6H23.2M8.8 18.4H22.4"/><path stroke="#e5484d" stroke-width="2.2" d="M9.3 7.3C15.3 3.7 27.1 4.5 28.7 11.5 30.4 19.1 22 26.7 12.8 27.2 5.9 27.6 2 23.5 3.5 18.1 4.8 13.3 11.1 9.7 18.1 9.6"/></g></svg>`;
const menuIcon = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;

// The example tabs, the Preview/Code switch, the install command's copy button, and the active sidebar link. Without it the page still reads top to bottom.
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
for (const button of document.querySelectorAll(".grid-copy")) button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.copy);
  button.classList.add("copied");
  setTimeout(() => button.classList.remove("copied"), 1200);
});
// The index's window types its Markdown once it's half in view, then wipes to the rendered page. A tab chosen first
// stops it.
for (const win of document.querySelectorAll(".window")) {
  const tabs = [...win.querySelectorAll("[role=tab]")], panels = [...win.querySelectorAll("[role=tabpanel]")];
  const place = indicate(win.querySelector(".window-tabs"), "[aria-selected=true]");
  let timer, transition = 0;
  const show = (i, wipe) => {
    clearTimeout(timer); delete win.dataset.typing; delete win.dataset.waiting;
    if (tabs[i].getAttribute("aria-selected") === "true") return;
    const currentTransition = ++transition;
    for (const [j, t] of tabs.entries()) { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1 }
    const [from, to] = [panels[1 - i], panels[i]];
    to.toggleAttribute("data-active", true); to.inert = false; from.inert = true;
    const done = () => { if (currentTransition === transition) from.removeAttribute("data-active") };
    if (wipe && !reduce.matches) to.animate({ clipPath: ["inset(0 100% 0 0)", "inset(0)"] }, { duration: 700, easing: "cubic-bezier(0.77, 0, 0.175, 1)" }).finished.then(done); else done();
    place();
  };
  win.querySelector(".window-tabs").addEventListener("click", e => { const t = e.target.closest("[role=tab]"); if (t) show(tabs.indexOf(t), true) });
  win.querySelector(".window-tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = tabs.indexOf(e.target) === 0 ? 1 : 0; show(i, true); tabs[i].focus();
  });
  if (reduce.matches) { show(1); continue }
  win.dataset.waiting = "";
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    if (!win.hasAttribute("data-waiting")) return;
    delete win.dataset.waiting; win.dataset.typing = "";
    timer = setTimeout(() => show(1, true), parseFloat(getComputedStyle(win).getPropertyValue("--typed")) + 900);
  }, { rootMargin: "0px 0px 100% 0px", threshold: 0 });
  seen.observe(win);
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
// The header's field on wide pages, and the menu's on narrow ones.
const opens = document.querySelectorAll(".search-open"), menu = document.querySelector(".menu"), dialog = document.querySelector("dialog.search");
const input = dialog.querySelector("input"), list = dialog.querySelector("[role=listbox]"), empty = dialog.querySelector(".search-empty");
let entries, results = [], active = 0;
const load = () => entries ??= fetch("/search.json").then(r => r.json());
for (const open of opens) open.hidden = false;
if (/Mac|iP(hone|ad)/.test(navigator.platform)) document.querySelector(".search-open kbd").textContent = "⌘K";
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
const show = () => { menu.open = false; dialog.showModal(); input.select(); update() };
for (const open of opens) { open.addEventListener("click", show); open.addEventListener("pointerenter", load, { once: true }) }
dialog.addEventListener("close", () => input.setAttribute("aria-expanded", "false"));
dialog.querySelector(".search-close").addEventListener("click", () => dialog.close());
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
  ...[landing, ...parsed].flatMap((page) => {
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

// The page around the content: header, rail, the section's column, and a menu that holds both on narrow screens. The
// landing page has no sidebar, so its header links to the docs and the playground instead.
function shell(options: {
  slug: string;
  section: Section;
  title: string;
  description: string;
  head?: string;
  body: string;
  // The package the npmx link opens; the section's by default.
  npm?: string;
  landing?: boolean;
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
<style>${style}${iconCss}</style>${options.head ?? ""}
</head>
<body>
<header class="top">
<div class="top-start"><a class="name" href="/">${logo}comark plugins</a>${options.landing ? `<nav class="top-links" aria-label="Site"><a href="/guide/renderers/">Docs</a><a href="/play/">Playground</a><a href="https://drop.vitehub.dev">Drop</a></nav>` : ""}</div>
<button type="button" class="search-open" aria-haspopup="dialog" hidden>${siteIcon("search", 15)}<span>Search docs</span><kbd>Ctrl K</kbd></button>
<div class="top-end">
<nav>${npmxLink(npm)}${githubLink}</nav>
<details class="menu"><summary aria-label="Menu" title="Menu">${menuIcon}</summary><div class="menu-panel"><button type="button" class="search-open menu-search" aria-haspopup="dialog" hidden>${siteIcon("search", 15)}<span>Search docs</span></button>${nav}</div></details>
</div>
</header>
<dialog class="search" aria-label="Search the docs">
<div class="search-field">${siteIcon("search", 16)}<input type="text" enterkeyhint="search" role="combobox" aria-label="Search the docs" aria-controls="search-results" aria-expanded="false" aria-autocomplete="list" placeholder="Search the docs" autocomplete="off" spellcheck="false"><kbd>Esc</kbd><button type="button" class="search-close">Cancel</button></div>
<div id="search-results" class="search-results" role="listbox" aria-label="Results"></div>
<p class="search-empty" role="status" hidden>No page or heading matches.</p>
</dialog>
${options.landing ? options.body : `<div class="layout">\n<aside class="sidebar">${nav}</aside>\n${options.body}\n</div>`}
<script>${searchScript.trim()}</script>
</body>
</html>
`;
}

const footer = (credits?: string) =>
  `<footer><span>Built on <a href="https://comark.dev">Comark</a> by the <a href="https://github.com/comarkdown">Comark team</a>.${credits ? ` ${credits}` : ""}</span><span>Made by <a href="https://onmax.me">Maxi García</a></span></footer>`;

// The landing page, as on vitehub.dev: the headline beside the install command, the packages, the example, and Drop.
await writeFile(
  new URL("index.html", dist),
  shell({
    slug: "",
    section: sections[0],
    landing: true,
    title: `${landing.title} · ${landing.description}`,
    description: landing.tagline,
    body: `<div class="landing">
<div class="landing-hero enter"><div><h1>${escapeHtml(landing.headline)}</h1><p>${escapeHtml(landing.tagline)}</p></div>
<div>${installerFor(landing.install, "")}<div class="actions"><a class="button primary" href="/play/">${siteIcon("flask-conical", 15)}Open the playground</a><a class="button" href="/guide/renderers/">Read the docs${siteIcon("arrow-right", 15)}</a></div></div></div>
<main class="enter" style="--i:1">${await renderHtmlFromDocument(landing.document, { components: { ...components, packages: packageGrid, drop, hero } })}</main>
${footer()}
</div>
<script>${script.trim()}</script>`,
  }),
);
console.log("docs/dist/index.html written");

for (const page of parsed) {
  const out = new URL(`${page.slug}/`, dist);
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
<div class="hero enter">${subpage ? `<p class="eyebrow mono">${npm}</p>` : ""}<h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.tagline)}</p>
${page.install ? installerFor(page.install, page.skill) : ""}</div>
<main class="enter" style="--i:1">${(await renderHtmlFromDocument(page.document, { components: { ...components, example, examples, matrix } })).replace(/<table>[\s\S]*?<\/table>/g, (table) => `<div class="table-scroll">${table}</div>`)}</main>
${pager(page)}
${footer(page.section.credits)}
</div>
${page.toc ? `<aside class="toc"><nav aria-label="On this page"><p class="nav-group">On this page</p>${page.toc}</nav></aside>` : ""}
</div>
<script>${script.trim()}</script>`,
    }),
  );
  console.log(`docs/dist/${page.slug}/index.html written`);
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
<div class="play-bar"><div class="seg play-panes" role="group" aria-label="Editor"><button type="button" data-pane="markdown" aria-pressed="true">Markdown</button><button type="button" data-pane="config" aria-pressed="false">Config</button></div><button type="button" class="play-share">Copy link</button></div>
<div class="play-code" data-pane="markdown"><div class="play-paint" aria-hidden="true">${highlight(`${first.source}\n `)}</div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Markdown">${escapeHtml(first.source)}</textarea></div>
<div class="play-code" data-pane="config" hidden><div class="play-paint" aria-hidden="true">${highlight(`${defaultConfig}\n `, "json")}</div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Config">${escapeHtml(defaultConfig)}</textarea></div>
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

import { renderHtmlFromDocument } from "@comark/html";
import { components as annotateComponents } from "comark-annotate/html";
import { components as carouselComponents } from "comark-carousel/html";
import { components as chartsComponents } from "comark-charts/html";
import { components as codeComponents } from "comark-code/html";
import { components as diffComponents } from "comark-diff/html";
import { components as embedComponents } from "comark-embed/html";
import { components as githubCalloutsComponents } from "comark-github/html";
import { createIcons, components as iconComponents, iconHtml, iconStyles } from "comark-icon/html";
import { components as tabsComponents } from "comark-tabs/html";
import { components as zoomComponents } from "comark-zoom/html";
import type { ElementNode, Node, NodeHandler } from "comark";
import { parseMarkdown } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import { icons as lucide } from "@iconify-json/lucide";
import { deflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { createError, defineEventHandler, getQuery, getRouterParam } from "nuxt/server";
import { copyIcon } from "#shared/chrome";
import type { Page } from "#shared/pages";
import { content, plugins } from "../../content";

type PageLink = { slug: string; npm: string };

async function listPages(): Promise<PageLink[]> {
  const files = await content.list();
  return files
    .map(({ path, data }) => ({
      slug: path.replace(/^\/|\/$/g, ""),
      npm: str(data.install).match(/(?:^|\s)(comark-[\w-]+)/)?.[1] ?? "",
    }))
    .sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : a.slug.localeCompare(b.slug)));
}

const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...chartsComponents,
  ...codeComponents,
  ...diffComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
  ...iconComponents,
  ...tabsComponents,
  ...zoomComponents,
};

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const str = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);
const isPre = (node: Node): node is ElementNode => isElement(node) && node[0] === "pre";
const playgroundMarkdown = (source: string) =>
  `/play/#md=${deflateRawSync(source.trimEnd()).toString("base64url")}`;

// An example shows the Markdown in its code block twice: rendered, and as source.
const example: NodeHandler = async ([, attrs, ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error(`Example "${str(attrs.label)}" needs a fenced code block.`);
  const preview = await parseMarkdown(textContent(pre), { plugins: plugins() });
  if (preview.meta.issues.length)
    throw new Error(`Example "${str(attrs.label)}":\n${preview.meta.issues.join("\n")}`);
  const source = textContent(pre);
  return (
    `<div class="example"><div class="example-bar"><div class="seg" role="group" aria-label="View">` +
    `<button type="button" data-view="preview" aria-pressed="true">Preview</button><button type="button" data-view="code" aria-pressed="false">Code</button></div></div>` +
    `<a class="example-play" href="${playgroundMarkdown(source)}">Open in playground</a>` +
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

async function read(slug: string) {
  const file = await content.get(`/${slug}`);
  if (!file) throw createError({ status: 404, message: `No page at /${slug}.` });
  const issues = (file.meta.issues as string[] | undefined) ?? [];
  if (issues.length) throw new Error(`/${slug}:\n${issues.join("\n")}`);
  return file;
}

// The site's own icons, drawn the way `:icon` draws them: Lucide's, and annotate's, a hand-drawn loop like its marks.
const ownIcons = {
  "scribble-loop": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5.5C11.5 2.8 20.3 3.4 21.5 8.6 22.8 14.3 16.5 20 9.6 20.4 4.4 20.7 1.5 17.6 2.6 13.6 3.6 10 8.3 7.3 13.6 7.2"/></svg>`,
};
const siteIcons = createIcons({ collections: { lucide, site: ownIcons }, fetch: false });
const iconId = (name: string) => (name in ownIcons ? `site:${name}` : `lucide:${name}`);

// The index's grid: one tile per package, with the icon and blurb from its page's front matter.
const packageGrid: NodeHandler = async (_, state) => {
  const packages = await Promise.all(
    (await listPages())
      .filter((page) => page.npm && page.slug && !page.slug.includes("/"))
      .map(async (page) => ({ ...page, data: (await read(page.slug)).data })),
  );
  const icons = await siteIcons.resolve(packages.map(({ data }) => iconId(str(data.icon))));
  const tiles = packages.map(({ slug, npm, data }) => {
    const icon = icons.get(iconId(str(data.icon)));
    if (!icon || "problem" in icon)
      throw new Error(`packages/${slug}/docs/index.md: no icon "${str(data.icon)}".`);
    const command = escapeHtml(`pnpm add ${npm}`);
    return `<li><a href="/${slug}/">${iconHtml(icon).replace('style="', 'style="--comark-icon-size:24px;')}<strong>${escapeHtml(slug)}</strong><span>${escapeHtml(str(data.blurb))}</span></a><button type="button" class="grid-copy" data-copy="${command}" aria-label="Copy ${command}">${copyIcon}</button></li>`;
  });
  return `${iconStyles(state)}<ul class="grid" aria-label="Packages">${tiles.join("")}</ul>`;
};

// The homepage uses two small layout components that are part of the docs
// content (rather than Comark plugins). Keep them in the server renderer so
// the Nuxt build preserves the interactive Markdown window from the legacy
// builder.
const hero: NodeHandler = async ([, , ...children], state) => {
  // The landing page keeps the intentionally broken draft beside the fixed
  // document for the studio. The server-rendered page must use the latter.
  const pre = children.filter(isPre).at(-1);
  if (!pre) throw new Error("The hero needs a fenced code block.");
  const source = textContent(pre).trimEnd();
  const rendered = await parseMarkdown(source, { plugins: plugins() });
  if (rendered.meta.issues.length) throw new Error(rendered.meta.issues.join("\n"));
  const intro = children.filter((child) => !isPre(child));
  return `<section class="showcase"><div class="split">${await state.flow(["div", {}, ...intro], state)}</div><div class="window"><div class="window-bar"><div class="window-tabs" role="tablist" aria-label="The example"><button type="button" role="tab" id="window-source-tab" aria-controls="window-source" aria-selected="true">review.md</button><button type="button" role="tab" id="window-page-tab" aria-controls="window-page" aria-selected="false" tabindex="-1">Rendered</button></div></div><div class="window-body"><div class="window-source" id="window-source" role="tabpanel" aria-labelledby="window-source-tab" data-active><pre>${escapeHtml(source)}</pre></div><div class="window-page" id="window-page" role="tabpanel" aria-labelledby="window-page-tab" inert>${await state.flow(["div", {}, ...rendered.nodes], state)}</div></div></div></section>`;
};

const drop: NodeHandler = async ([, , ...children], state) =>
  `<section class="drop">${await state.flow(["div", {}, ...children], state)}</section>`;

export default defineEventHandler(async (event): Promise<Page> => {
  const param = (getRouterParam(event, "slug") ?? "").replace(/\/$/, "");
  const slug = param === "index" ? "" : param;
  const pages = await listPages();
  const page = pages.find((candidate) => candidate.slug === slug);
  if (!page) throw createError({ status: 404, message: `No page at /${slug}.` });
  const file = await read(slug);
  const document = { nodes: file.nodes, frontmatter: file.data, meta: file.meta };
  // The page shell asks without the body, which the PageBody server component renders.
  let html =
    getQuery(event).body === "0"
      ? ""
      : // A table wider than the column scrolls inside it instead of widening the page.
        (
          await renderHtmlFromDocument(document, {
            components: {
              ...components,
              example,
              examples,
              matrix,
              packages: packageGrid,
              hero,
              drop,
            },
          })
        ).replace(
          /<table>[\s\S]*?<\/table>/g,
          (table) => `<div class="table-scroll">${table}</div>`,
        );
  // The landing page has a richer build-time renderer (canvas and studio). Reuse
  // its generated body for the Nuxt island when the docs build has produced it.
  if (slug === "" && getQuery(event).body !== "0") {
    try {
      const path = `${process.cwd()}/docs/dist/index.html`;
      await access(path);
      const source = await readFile(path, "utf8");
      const start = source.indexOf('<div class="landing">');
      const end = source.lastIndexOf("<script>");
      if (start >= 0 && end > start) html = source.slice(start, end);
    } catch {
      // Fall back to the server renderer when no static landing body exists.
    }
  }
  const nav = file.nodes
    .filter(isElement)
    .filter(([tag]) => tag === "h2" || tag === "h3")
    .map((node) => ({
      level: node[0] as "h2" | "h3",
      id: str(node[1].id),
      text: textContent(node),
    }));
  const [title, description, tagline, install] = ["title", "description", "tagline", "install"].map(
    (key) => str(file.data[key]),
  );
  return {
    ...page,
    title: title!,
    description: description!,
    tagline: tagline!,
    install: install!,
    html,
    nav,
    pages,
  };
});

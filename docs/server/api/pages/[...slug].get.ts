import { renderHtmlFromDocument } from "@comark/html";
import { components as annotateComponents } from "comark-annotate/html";
import { components as carouselComponents } from "comark-carousel/html";
import { components as chartsComponents } from "comark-charts/html";
import { components as embedComponents } from "comark-embed/html";
import { components as githubCalloutsComponents } from "comark-github-callouts/html";
import { components as tabsComponents } from "comark-tabs/html";
import { components as zoomComponents } from "comark-zoom/html";
import type { ElementNode, Node, NodeHandler } from "comark";
import { parseMarkdown } from "comark";
import { escapeHtml, textContent } from "comark/utils";
import { defineHandler, getQuery, getRouterParam, HTTPError } from "nitro/h3";
import type { Page } from "#shared/pages";
import { content, plugins } from "../../content";

type PageLink = { slug: string; npm: string };

async function listPages(): Promise<PageLink[]> {
  const listed = (await content.list()) as unknown;
  const items = Array.isArray(listed)
    ? listed
    : listed && typeof listed === "object" && "items" in listed && Array.isArray(listed.items)
      ? listed.items
      : [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as { id?: unknown; path?: unknown; data?: { install?: unknown } };
      const raw =
        typeof value.id === "string" ? value.id : typeof value.path === "string" ? value.path : "";
      const normalized = raw
        .replace(/^\//, "")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "");
      const slug = normalized === "index" ? "" : normalized;
      const install = typeof value.data?.install === "string" ? value.data.install : "";
      const match = install.match(/(?:^|\s)(comark-[\w-]+)/);
      return { slug, npm: match?.[1] ?? "" };
    })
    .filter((page): page is PageLink => page !== null)
    .sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : a.slug.localeCompare(b.slug)));
}

const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...chartsComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
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

// An example shows the Markdown in its code block twice: rendered, and as source.
const example: NodeHandler = async ([, attrs, ...children], state) => {
  const pre = children.find(isPre);
  if (!pre) throw new Error(`Example "${str(attrs.label)}" needs a fenced code block.`);
  const preview = await parseMarkdown(textContent(pre), { plugins: plugins() });
  if (preview.meta.issues.length)
    throw new Error(`Example "${str(attrs.label)}":\n${preview.meta.issues.join("\n")}`);
  return (
    `<div class="example"><div class="example-bar"><div class="seg" role="group" aria-label="View">` +
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

async function read(slug: string) {
  const file = await content.get(`/${slug}`);
  if (!file) throw new HTTPError({ status: 404, message: `No page at /${slug}.` });
  const issues = (file.meta.issues as string[] | undefined) ?? [];
  if (issues.length) throw new Error(`docs/pages/${slug || "index"}.md:\n${issues.join("\n")}`);
  return file;
}

// The index lists every package from its own page's front matter.
const pluginCards: NodeHandler = async () => {
  const pages = await listPages();
  const cards = await Promise.all(
    pages
      .filter((page) => page.npm)
      .map(async (page) => {
        const { data } = await read(page.slug);
        return `<a class="card" href="/${page.slug}/"><strong>${escapeHtml(str(data.title))}</strong><span>${escapeHtml(str(data.description))}</span><code>${escapeHtml(str(data.install).replace(/^pnpm add (comark @comark\/html )?/, "pnpm add "))}</code></a>`;
      }),
  );
  return `<div class="cards">${cards.join("")}</div>`;
};

export default defineHandler(async (event): Promise<Page> => {
  const param = (getRouterParam(event, "slug") ?? "").replace(/\/$/, "");
  const slug = param === "index" ? "" : param;
  const pages = await listPages();
  const page = pages.find((candidate) => candidate.slug === slug);
  if (!page) throw new HTTPError({ status: 404, message: `No page at /${slug}.` });
  const file = await read(slug);
  const document = { nodes: file.nodes, frontmatter: file.data, meta: file.meta };
  // The page shell asks without the body, which the PageBody server component renders.
  const html =
    getQuery(event).body === "0"
      ? ""
      : await renderHtmlFromDocument(document, {
          components: { ...components, example, examples, plugins: pluginCards },
        });
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

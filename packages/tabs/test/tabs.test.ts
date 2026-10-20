import { createHtmlRenderer } from "@comark/html";
import { defineComarkPlugin, parseMarkdown } from "comark";
import { describe, expect, it } from "vite-plus/test";
import tabs, { components } from "../src/html.ts";

const render = (markdown: string) =>
  createHtmlRenderer({ plugins: [tabs()], components })(markdown);
const issues = async (markdown: string) =>
  (await parseMarkdown(markdown, { plugins: [tabs()] })).meta.issues;
// Without the inline styles and script, whose source mentions attributes of its own.
const markup = async (markdown: string) =>
  (await render(markdown)).replace(/<style[^>]*>.*?<\/style><script>.*?<\/script>/s, "");

const os =
  '::tabs{sync="os"}\n:::tabs-item{label="macOS"}\nPress **⌘K**.\n:::\n\n:::tabs-item{label="Windows"}\nPress Ctrl+K.\n:::\n::';
const pm =
  '::code-group{sync="pm"}\n```bash [pnpm]\npnpm add x\n```\n\n```bash [npm]\nnpm i x\n```\n::';

describe("comark-tabs", () => {
  it("renders a tab strip and panels with WAI-ARIA tabs markup", async () => {
    const html = await render(os);
    const [, id] = /id="(ct-[a-z0-9]+-1)-tab-1"/.exec(html) ?? [];
    expect(html).toContain(
      '<div class="ct" data-tabs-sync="os"><div class="ct-list" role="tablist">' +
        `<button type="button" class="ct-tab" role="tab" id="${id}-tab-1" aria-controls="${id}-panel-1" aria-selected="true" tabindex="0">macOS</button>` +
        `<button type="button" class="ct-tab" role="tab" id="${id}-tab-2" aria-controls="${id}-panel-2" aria-selected="false" tabindex="-1">Windows</button></div>`,
    );
    expect(html).toContain(
      `<div class="ct-panel" role="tabpanel" id="${id}-panel-1" aria-labelledby="${id}-tab-1" tabindex="0"><div class="ct-caption">macOS</div>`,
    );
    // Without the script every panel shows, so none of them is `hidden`.
    expect(html).toContain(
      `<div class="ct-panel" role="tabpanel" id="${id}-panel-2" aria-labelledby="${id}-tab-2" tabindex="0" data-inactive><div class="ct-caption">Windows</div>`,
    );
    expect(await markup(os)).not.toContain("hidden");
    expect(html).toContain("<strong>⌘K</strong>");
    expect(html.match(/<script>/g)).toHaveLength(1);
  });

  it("numbers the ids of every block in a document, the same on every render, and inlines the script once", async () => {
    const html = await markup(`${os}\n\n${os}`);
    expect(html).toMatch(/id="ct-[a-z0-9]+-1-tab-1"/);
    expect(html).toMatch(/id="ct-[a-z0-9]+-2-tab-1"/);
    expect(await markup(`${os}\n\n${os}`)).toBe(html);
    expect((await render(`${os}\n\n${os}`)).match(/<script>/g)).toHaveLength(1);
  });

  it("keeps the ids of two documents on one page apart, and apart from the author's", async () => {
    const page = (
      await Promise.all([os, `# Setup {#ct-1-tab-1}\n\n${os}\n\n${pm}`].map(markup))
    ).join("");
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);
    expect(ids).toContain("ct-1-tab-1");
    expect(ids.length).toBeGreaterThan(12);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("turns a code group into tabs labelled by each block's filename", async () => {
    const html = await markup(pm);
    expect(html).toContain('<div class="ct" data-tabs-code data-tabs-sync="pm">');
    expect(html).toContain('aria-selected="true" tabindex="0">pnpm</button>');
    expect(html).toContain('aria-selected="false" tabindex="-1">npm</button>');
    expect(html).toContain('<div class="ct-caption">npm</div><pre language="bash">');
    // The tab names the block, so the block's own chrome doesn't repeat it.
    expect(html).not.toContain("filename");
  });

  it("keeps tabs inside a tab apart", async () => {
    const html = await markup(
      '::tabs\n:::tabs-item{label="Outer"}\n::::tabs\n:::::tabs-item{label="Inner"}\nIn\n:::::\n::::\n:::\n::',
    );
    expect(html).toMatch(/id="ct-[a-z0-9]+-1-tab-1"/);
    expect(html).toMatch(/id="ct-[a-z0-9]+-2-tab-1"/);
    expect(html.match(/class="ct-list"/g)).toHaveLength(2);
  });

  it("falls back to a label it can show, and skips comments", async () => {
    const html = await markup(
      "::tabs\n:::tabs-item\nOne\n:::\n\n<!-- a note -->\n::\n\n::code-group\n```ts\nconst a = 1\n```\n\n```\nplain\n```\n::",
    );
    expect(html).toContain(">Tab 1</button>");
    expect(html.match(/role="tabpanel"/g)).toHaveLength(3);
    expect(html).toContain(">ts</button>");
    expect(html).toContain(">Code 2</button>");
  });

  it("renders a tab outside tabs as plain content", async () => {
    const html = await render(':::tabs-item{label="Lost"}\nOne\n:::');
    expect(html).toMatch(/^<div>\s*One\s*<\/div>/);
    expect(html).not.toMatch(/ct-|undefined/);
  });

  it("reports problems in meta.issues, naming the block and the fix", async () => {
    expect(await issues(`${os}\n\n${pm}`)).toEqual([]);
    expect(
      await issues(
        '::tabs\n:::tabs-item{label="A"}\nA\n:::\n::\n\n::tabs\n:::tabs-item{label="A"}\nA\n:::\n\n:::tabs-item{label="B"}\nB\n:::\n\n:::tabs-item\nC\n:::\n::',
      ),
    ).toEqual(['`::tabs` 2, tab 3: `label` is required. Write `:::tabs-item{label="..."}`.']);
    expect(await issues('::tabs\n:::tabs-item{label="A"}\nA\n:::\n\nStray text\n::')).toEqual([
      '`::tabs` 1: put each tab in `:::tabs-item{label="..."}`. Found the paragraph "Stray text" outside a tab, so it doesn\'t render.',
    ]);
    expect(await issues("::code-group\n```bash [pnpm]\na\n```\n\n```bash\nb\n```\n::")).toEqual([
      "`::code-group` 1, block 2: a code block needs a label. Put it in brackets after the language: ```bash [npm].",
    ]);
    expect(await issues("::code-group\n```bash [pnpm]\na\n```\n\nSome text\n::")).toEqual([
      '`::code-group` 1: only code blocks go inside. Move the paragraph "Some text" out, or use `::tabs`.',
    ]);
    expect(
      await issues(
        '::tabs\n:::tabs-item{label="npm"}\na\n:::\n\n:::tabs-item{label="npm"}\nb\n:::\n::',
      ),
    ).toEqual([
      '`::tabs` 1: two tabs are labelled "npm". Labels must differ, because `sync` matches tabs by label.',
    ]);
    expect(await issues("::tabs\n::\n\n::code-group\n::")).toEqual([
      '`::tabs` 1 has no tabs. Put `:::tabs-item{label="..."}` blocks inside it, or remove it.',
      "`::code-group` 1 has no code blocks. Put fenced code blocks inside it, or remove it.",
    ]);
    expect(await issues(':::tabs-item{label="Lost"}\nOne\n:::')).toEqual([
      '`:::tabs-item` 1 ("Lost") sits outside `::tabs`, so it renders as plain content. Wrap it in `::tabs`, or remove the `:::tabs-item` fence.',
    ]);
  });

  it("reads bound labels and sync from the front matter", async () => {
    const html = await markup(
      '---\nkey: os\nname: Linux\n---\n::tabs{:sync="frontmatter.key"}\n:::tabs-item{:label="frontmatter.name"}\nOne\n:::\n::',
    );
    expect(html).toContain('data-tabs-sync="os"');
    expect(html).toContain(">Linux</button>");
  });

  it("adds its issues to the ones other plugins found", async () => {
    const before = defineComarkPlugin(() => ({
      name: "before",
      post(state) {
        state.tree.meta.issues = ["An earlier plugin's issue."];
      },
    }));
    const document = await parseMarkdown("::tabs\n::", { plugins: [before(), tabs()] });
    expect(document.meta.issues).toHaveLength(2);
    expect(document.meta.issues[0]).toBe("An earlier plugin's issue.");
  });
});

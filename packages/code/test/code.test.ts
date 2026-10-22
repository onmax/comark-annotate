import { createHtmlRenderer } from "@comark/html";
import shiki from "@comark/html/plugins/shiki";
import { parseMarkdown } from "comark";
import tabs, { components as tabsComponents } from "comark-tabs/html";
import { describe, expect, it } from "vite-plus/test";
import code, { type CodeOptions, components } from "../src/html.ts";

const render = (markdown: string, options?: CodeOptions) =>
  createHtmlRenderer({ plugins: [code(options)], components })(markdown);
// Without the inline styles and script, whose source mentions classes of its own.
const markup = async (markdown: string, options?: CodeOptions) =>
  (await render(markdown, options)).replace(/<style[^>]*>.*?<\/style><script>.*?<\/script>/s, "");
const bar = (markdown: string, options?: CodeOptions) =>
  markup(markdown, options).then((html) => /<div class="ck-bar">(.*?)<\/div>/s.exec(html)?.[1]);
// A resolver that draws `test:*` icons and can't find any other.
const iconResolver = {
  resolve: async (values: Iterable<string>) =>
    new Map(
      [...values].map((value) => [
        value,
        value.startsWith("test:")
          ? { name: value, src: "data:image/svg+xml,x", ratio: 1, mask: true }
          : { problem: "missing" as const },
      ]),
    ),
};

const run = { id: "run", label: "Run", languages: ["sh", "Bash"] };
const sh = "```sh\npnpm add comark-code\n```";

describe("comark-code", () => {
  it("wraps a code block with Wrap and Copy buttons, and leaves the block as it was", async () => {
    const html = await markup(sh);
    expect(html).toMatch(
      /^<div class="ck"><pre data-language="sh"><code class="language-sh">pnpm add comark-code<\/code><\/pre><div class="ck-bar"><span class="ck-title">sh<\/span><button/,
    );
    expect(html).toContain(
      '<button type="button" class="ck-wrap" aria-label="Wrap lines" aria-pressed="false" title="Wrap lines">',
    );
    expect(html).toContain(
      '<button type="button" class="ck-copy" aria-label="Copy code" title="Copy">',
    );
    expect(html).toContain('<span class="ck-status" role="status"></span></div></div>');
  });

  it("titles the header with the file's name, else the language, else nothing", async () => {
    expect(await bar("```ts [config.ts]\nconst a = 1\n```")).toMatch(
      /^<span class="ck-title">config.ts<\/span><button/,
    );
    expect(await bar("```\nplain\n```")).toMatch(/^<button/);
  });

  it("inlines the styles and script once per document", async () => {
    const html = await render(`${sh}\n\n${sh}`);
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html.match(/class="ck"/g)).toHaveLength(2);
    expect(await render("No code here.")).not.toContain("<script>");
  });

  it("inlines styles a site can theme with --ck-* variables, with today's look as the fallback", async () => {
    const style = /<style data-comark-code>(.*?)<\/style>/s.exec(await render(sh))?.[1];
    expect(style).toContain("div.ck>pre{padding-top:var(--_ck-bar)}");
    expect(style).toContain("height:var(--_ck-bar)");
  });

  it("keeps Shiki's highlighting and the block's filename", async () => {
    const html = await createHtmlRenderer({ plugins: [code(), shiki()], components })(
      "```ts [config.ts]\nconst a = 1\n```",
    );
    expect(html).toMatch(
      /<div class="ck"><pre data-language="ts" data-filename="config.ts" class="shiki /,
    );
    expect(html).toContain("--shiki-dark:");
  });

  it("adds your actions to the blocks in their languages, before Wrap and Copy", async () => {
    const options = { actions: [run, { id: "explain", label: "Explain" }] };
    expect(await bar("```bash\nls\n```", options)).toMatch(
      /^<span class="ck-title">bash<\/span><button type="button" class="ck-action" data-code-action="run">Run<\/button><button type="button" class="ck-action" data-code-action="explain">Explain<\/button><button type="button" class="ck-wrap"/,
    );
    const ts = await bar("```ts\nconst a = 1\n```", options);
    expect(ts).not.toContain(">Run<");
    expect(ts).toContain(">Explain<");
    expect(await bar("```\nplain\n```", { actions: [run] })).not.toContain("ck-action");
  });

  it("draws an action's icon before its label, or alone and named by its title", async () => {
    const html = await bar(sh, {
      iconResolver,
      actions: [
        { id: "run", label: "Run", icon: "test:play" },
        { id: "share", icon: "test:share", title: "Share snippet" },
      ],
    });
    expect(html).toContain(
      '<button type="button" class="ck-action" data-code-action="run"><span class="ci" data-mask aria-hidden="true" style="--ci:url(&quot;data:image/svg+xml,x&quot;)"></span>Run</button>',
    );
    expect(html).toContain(
      '<button type="button" class="ck-action" data-code-action="share" aria-label="Share snippet" title="Share snippet"><span class="ci" data-mask',
    );
  });

  it("shows an icon-only action's title when its icon can't be drawn, and says why", async () => {
    const options = {
      iconResolver,
      actions: [{ id: "share", icon: "lucide:nope", title: "Share" }],
    };
    expect(await bar(sh, options)).toContain('data-code-action="share">Share</button>');
    const document = await parseMarkdown(sh, { plugins: [code(options)] });
    expect(document.meta.issues).toEqual([
      expect.stringMatching(
        /^The comark-code action "share" shows "Share" as text on its code blocks, because it can't draw its icon "lucide:nope": The `lucide` set has no icon `nope`\./,
      ),
    ]);
  });

  it("escapes an action's id and label, and never leaks `actions` onto the block", async () => {
    const html = await markup(sh, { actions: [{ id: 'a"b', label: "<Run & go>" }] });
    expect(html).toContain('data-code-action="a&quot;b">&lt;Run &amp; go&gt;</button>');
    expect(html).not.toMatch(/actions|undefined|\[object/);
  });

  it("puts the buttons on code blocks inside a code group, whichever plugin runs first", async () => {
    const group = "::code-group\n```sh [pnpm]\npnpm add x\n```\n\n```sh [npm]\nnpm i x\n```\n::";
    for (const plugins of [
      [code({ actions: [run] }), tabs()],
      [tabs(), code({ actions: [run] })],
    ]) {
      const html = await createHtmlRenderer({
        plugins,
        components: { ...tabsComponents, ...components },
      })(group);
      expect(html).toContain('<div class="ct" data-tabs-code>');
      expect(html.match(/<div class="ck"><pre data-language="sh">/g)).toHaveLength(2);
      expect(html.match(/data-code-action="run"/g)).toHaveLength(2);
    }
  });

  it("leaves the document's issues alone", async () => {
    const document = await parseMarkdown(sh, { plugins: [code({ actions: [run] })] });
    expect(document.meta.issues ?? []).toEqual([]);
  });
});

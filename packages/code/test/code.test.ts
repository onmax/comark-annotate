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

const run = { id: "run", label: "Run", languages: ["sh", "Bash"] };
const sh = "```sh\npnpm add comark-code\n```";

describe("comark-code", () => {
  it("wraps a code block with Wrap and Copy buttons, and leaves the block as it was", async () => {
    const html = await markup(sh);
    expect(html).toMatch(
      /^<div class="ck"><pre data-language="sh"><code class="language-sh">pnpm add comark-code<\/code><\/pre><div class="ck-bar">/,
    );
    expect(html).toContain(
      '<button type="button" class="ck-wrap" aria-label="Wrap lines" aria-pressed="false" title="Wrap lines">',
    );
    expect(html).toContain(
      '<button type="button" class="ck-copy" aria-label="Copy code" title="Copy">',
    );
    expect(html).toContain('<span class="ck-status" role="status"></span></div></div>');
  });

  it("inlines the styles and script once per document", async () => {
    const html = await render(`${sh}\n\n${sh}`);
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html.match(/class="ck"/g)).toHaveLength(2);
    expect(await render("No code here.")).not.toContain("<script>");
  });

  it("inlines styles a site can theme with --ck-* variables, with today's look as the fallback", async () => {
    const style = /<style data-comark-code>(.*?)<\/style>/s.exec(await render(sh))?.[1];
    expect(style).toContain("top:var(--ck-inset,.5rem);right:var(--ck-inset,.5rem)");
    expect(style).toContain("height:var(--ck-button-size,1.75rem)");
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
      /^<button type="button" class="ck-action" data-code-action="run">Run<\/button><button type="button" class="ck-action" data-code-action="explain">Explain<\/button><button type="button" class="ck-wrap"/,
    );
    const ts = await bar("```ts\nconst a = 1\n```", options);
    expect(ts).not.toContain(">Run<");
    expect(ts).toContain(">Explain<");
    expect(await bar("```\nplain\n```", { actions: [run] })).not.toContain("ck-action");
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

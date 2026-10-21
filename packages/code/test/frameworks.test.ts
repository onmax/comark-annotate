import { readFile } from "node:fs/promises";
import { renderHtmlFromDocument } from "@comark/html";
import { MarkdownDocument as ReactDocument } from "@comark/react";
import { MarkdownDocument as VueDocument } from "@comark/vue";
import { type MarkdownDocument, parseMarkdown } from "comark";
import { createElement } from "react";
import { renderToString as renderReact } from "react-dom/server";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vite-plus/test";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import code from "../src/index.ts";
import { components as htmlComponents } from "../src/html.ts";
import { components as reactComponents } from "../src/react.ts";
import { components as vueComponents } from "../src/vue.ts";

const renderers = {
  html: (value: MarkdownDocument) => renderHtmlFromDocument(value, { components: htmlComponents }),
  vue: (value: MarkdownDocument) =>
    renderVue(createSSRApp({ render: () => h(VueDocument, { value, components: vueComponents }) })),
  react: (value: MarkdownDocument) =>
    renderReact(createElement(ReactDocument, { value, components: reactComponents })),
};
// Drops what differs only in serialization: comments, whitespace, empty attribute values, and the HTML renderer's
// inline styles and script.
const normalize = (html: string) =>
  html
    .replace(/<style[^>]*>.*?<\/style>|<script>.*?<\/script>/gs, "")
    .replace(/<!--.*?-->/g, "")
    .replace(/=""/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();

describe("comark-code renderers", () => {
  it("renders the same code blocks and buttons in every renderer", async () => {
    const value = await parseMarkdown(
      "```sh [install.sh]\npnpm add comark-code\n```\n\n```ts\nconst a = 1\n```",
      { plugins: [code({ actions: [{ id: "run", label: "Run", languages: ["sh"] }] })] },
    );
    const expected = normalize(await renderers.html(value));
    expect(expected).toContain(
      '<div class="ck"><pre data-language="sh" data-filename="install.sh"><code class="language-sh">pnpm add comark-code</code></pre><div class="ck-bar"><button type="button" class="ck-action" data-code-action="run">Run</button>',
    );
    expect(expected.match(/class="ck-copy"/g)).toHaveLength(2);
    for (const name of ["vue", "react"] as const) {
      const html = normalize(await renderers[name](value));
      expect(html, name).toContain(expected);
      expect(html, name).not.toMatch(/actions|undefined|\[object/);
    }
  });

  it("ships a Svelte component that compiles", async () => {
    const source = await readFile(new URL("../src/svelte/Pre.svelte", import.meta.url), "utf8");
    expect(() => compile(source, { filename: "Pre.svelte", generate: "server" })).not.toThrow();
  });
});

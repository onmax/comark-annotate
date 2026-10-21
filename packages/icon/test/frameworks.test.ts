import { readFile } from "node:fs/promises";
import { renderHtmlFromDocument } from "@comark/html";
import { MarkdownDocument as ReactDocument } from "@comark/react";
import { MarkdownDocument as VueDocument } from "@comark/vue";
import { parseMarkdown } from "comark";
import { createElement } from "react";
import { renderToString as renderReact } from "react-dom/server";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vite-plus/test";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import icon from "../src/index.ts";
import { components as htmlComponents } from "../src/html.ts";
import { components as reactComponents } from "../src/react.ts";
import { components as vueComponents } from "../src/vue.ts";

// Drops what differs only in serialization: comments, whitespace, the HTML renderer's inline styles, and how each
// framework writes quotes and the end of a style.
const normalize = (html: string) =>
  html
    .replace(/<!--.*?-->/g, "")
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/;"/g, '"')
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();

describe("comark-icon renderers", () => {
  it("draws the same icons in every renderer", async () => {
    const value = await parseMarkdown(
      ':icon{name="lucide:apple" label="Apple" #id .wide} and :icon{name="logos:pnpm"}',
      {
        plugins: [
          icon({
            collections: {
              lucide: {
                prefix: "lucide",
                icons: { apple: { body: '<path stroke="currentColor"/>' } },
              },
              logos: {
                prefix: "logos",
                icons: { pnpm: { body: "<path/>", width: 32, height: 16 } },
              },
            },
          }),
        ],
      },
    );
    const expected = normalize(await renderHtmlFromDocument(value, { components: htmlComponents }));
    expect(expected).toMatch(
      /^<p><span class="ci" data-mask role="img" aria-label="Apple" style="--ci:url\("data:/,
    );
    expect(expected).toContain('--ci-ratio:2"></span></p>');
    const vue = normalize(
      await renderVue(
        createSSRApp({ render: () => h(VueDocument, { value, components: vueComponents }) }),
      ),
    ).replace(/ data-mask=""/g, " data-mask");
    const react = normalize(
      renderReact(createElement(ReactDocument, { value, components: reactComponents })),
    ).replace(/ data-mask=""/g, " data-mask");
    expect(vue).toContain(expected);
    expect(react).toContain(expected);
  });

  it("ships a Svelte component that compiles", async () => {
    const source = await readFile(new URL("../src/svelte/Icon.svelte", import.meta.url), "utf8");
    expect(() => compile(source, { filename: "Icon.svelte", generate: "server" })).not.toThrow();
  });
});

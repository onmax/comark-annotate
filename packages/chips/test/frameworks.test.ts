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
import chips from "../src/index.ts";
import { components as htmlComponents } from "../src/html.ts";
import { components as reactComponents } from "../src/react.ts";
import { components as vueComponents } from "../src/vue.ts";

// Drops what differs only in serialization: comments, whitespace between tags, the HTML renderer's inline styles,
// and how each framework writes an empty attribute or closes an empty element.
const normalize = (html: string) =>
  html
    .replace(/<!--.*?-->/g, "")
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/\s*\/>/g, ">")
    .replace(/ alt=""/g, " alt")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/<p> /g, "<p>")
    .replace(/ <\/p>/g, "</p>")
    .trim();

describe("comark-chips renderers", () => {
  it("draws the same chips in every renderer", async () => {
    const value = await parseMarkdown('See [Vite](https://vite.dev "Docs") by @onmax.', {
      plugins: [chips({ download: false })],
    });
    const expected = normalize(await renderHtmlFromDocument(value, { components: htmlComponents }));
    expect(expected).toContain(
      '<a class="cp" href="https://vite.dev" data-kind="favicon" title="Docs"><img class="cp-img" src="https://www.google.com/s2/favicons?domain=vite.dev&amp;sz=64" alt>Vite</a>',
    );
    const vue = normalize(
      await renderVue(
        createSSRApp({ render: () => h(VueDocument, { value, components: vueComponents }) }),
      ),
    );
    const react = normalize(
      renderReact(createElement(ReactDocument, { value, components: reactComponents })),
    );
    expect(vue).toContain(expected);
    expect(react).toContain(expected);
  });

  it("ships a Svelte component that compiles", async () => {
    const source = await readFile(new URL("../src/svelte/Chip.svelte", import.meta.url), "utf8");
    expect(() => compile(source, { filename: "Chip.svelte", generate: "server" })).not.toThrow();
  });
});

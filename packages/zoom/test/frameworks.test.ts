import { readFile } from "node:fs/promises";
import { MarkdownDocument as ReactDocument } from "@comark/react";
import { MarkdownDocument as VueDocument } from "@comark/vue";
import { parseMarkdown } from "comark";
import { createElement } from "react";
import { renderToString as renderReact } from "react-dom/server";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vite-plus/test";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import zoom from "../src/index.ts";
import { components as reactComponents } from "../src/react.ts";
import { components as vueComponents } from "../src/vue.ts";

const markdown = '![One](a.png)\n\n::zoom{group="tour" title="Step"}\n> Any **content**\n::';
const parse = () => parseMarkdown(markdown, { plugins: [zoom()] });

describe("comark-zoom renderers", () => {
  it("renders the same zoomable markup in Vue", async () => {
    const value = await parse();
    const html = await renderVue(
      createSSRApp({ render: () => h(VueDocument, { value, components: vueComponents }) }),
    );
    expect(html).toMatch(/<img src="a.png" alt="One" data-zoom(="")? tabindex="0"/);
    expect(html).toMatch(
      /<div class="cz" data-zoom(="")? tabindex="0" data-zoom-group="tour" data-zoom-title="Step">/,
    );
    expect(html).toContain("<strong>content</strong>");
  });

  it("renders the same zoomable markup in React", async () => {
    const value = await parse();
    const html = renderReact(createElement(ReactDocument, { value, components: reactComponents }));
    expect(html).toMatch(/<img src="a.png" alt="One" data-zoom(="")? tabindex="0"/);
    expect(html).toMatch(
      /<div class="cz" data-zoom(="")? tabindex="0" data-zoom-group="tour" data-zoom-title="Step">/,
    );
    expect(html).toContain("<strong>content</strong>");
  });

  it("ships Svelte components that compile", async () => {
    for (const name of ["Zoom", "ZoomRuntime"]) {
      const source = await readFile(
        new URL(`../src/svelte/${name}.svelte`, import.meta.url),
        "utf8",
      );
      expect(() =>
        compile(source, { filename: `${name}.svelte`, generate: "server" }),
      ).not.toThrow();
    }
  });
});

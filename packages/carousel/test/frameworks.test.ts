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
import carousel from "../src/index.ts";
import { components as reactComponents } from "../src/react.ts";
import { components as vueComponents } from "../src/vue.ts";

const parse = () =>
  parseMarkdown('::carousel{title="Tour"}\nOne **bold**\n\nTwo\n::', { plugins: [carousel()] });
const expectCarousel = (html: string) => {
  expect(html).toMatch(
    /<div class="cc" data-zoom-gallery(="")? role="region" aria-roledescription="carousel" aria-label="Tour">/,
  );
  expect(html.match(/class="cc-slide"/g)).toHaveLength(2);
  expect(html).toMatch(/aria-label="2 of 2" data-zoom(="")? tabindex="0"/);
  expect(html.match(/class="cc-dot"/g)).toHaveLength(2);
  expect(html).toContain("<strong>bold</strong>");
};

describe("comark-carousel renderers", () => {
  it("renders the same carousel in Vue", async () => {
    const value = await parse();
    expectCarousel(
      await renderVue(
        createSSRApp({ render: () => h(VueDocument, { value, components: vueComponents }) }),
      ),
    );
  });

  it("renders the same carousel in React", async () => {
    const value = await parse();
    expectCarousel(
      renderReact(createElement(ReactDocument, { value, components: reactComponents })),
    );
  });

  it("ships Svelte components that compile", async () => {
    for (const name of ["Carousel", "Slide"]) {
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

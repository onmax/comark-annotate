import { createHtmlRenderer } from "@comark/html";
import { describe, expect, it } from "vite-plus/test";
import zoom, { components } from "../src/html.ts";

const render = (markdown: string, options?: Parameters<typeof zoom>[0]) =>
  createHtmlRenderer({ plugins: [zoom(options)], components })(markdown);

describe("comark-zoom", () => {
  it("makes content images zoomable and adds the script once", async () => {
    const html = await render("![One](a.png)\n\n![Two](b.png)");
    expect(html).toContain('<img src="a.png" alt="One" data-zoom="" tabindex="0">');
    expect(html).toContain('<img src="b.png" alt="Two" data-zoom="" tabindex="0">');
    expect(html.match(/<script>/g)).toHaveLength(1);
  });

  it("leaves linked images alone, and adds nothing when nothing zooms", async () => {
    const html = await render("[![Logo](logo.png)](https://example.com)");
    expect(html).toContain('<img src="logo.png" alt="Logo">');
    expect(html).not.toContain("<script>");
  });

  it("can leave every image alone", async () => {
    const html = await render("![One](a.png)", { images: false });
    expect(html).not.toContain("data-zoom");
    expect(html).not.toContain("<script>");
  });

  it("wraps any block in ::zoom, with a group and a title", async () => {
    const html = await render('::zoom{group="tour" title="Step one"}\n> Any **content**\n::');
    expect(html).toMatch(
      /^<div class="cz" data-zoom tabindex="0" data-zoom-group="tour" data-zoom-title="Step one"><blockquote>/,
    );
    expect(html).toContain("<strong>content</strong>");
    expect(html.match(/<script>/g)).toHaveLength(1);
  });

  it("escapes attributes and keeps the inline script closed", async () => {
    const html = await render('::zoom{title="</script><b>"}\nx\n::');
    expect(html).toContain('data-zoom-title="&lt;/script&gt;&lt;b&gt;"');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });
});

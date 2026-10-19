import { createHtmlRenderer } from "@comark/html";
import zoom, { components as zoomComponents } from "comark-zoom/html";
import { describe, expect, it } from "vite-plus/test";
import carousel, { components } from "../src/html.ts";

const render = (markdown: string) =>
  createHtmlRenderer({
    plugins: [carousel(), zoom()],
    components: { ...components, ...zoomComponents },
  })(markdown);

describe("comark-carousel", () => {
  it("makes every block a zoomable slide, with arrows and dots", async () => {
    const html = await render(
      '::carousel{title="Tour"}\n![One](a.png)\n\n```ts\nconst two = 2\n```\n\n> Three\n::',
    );
    expect(html).toContain(
      '<div class="cc" data-zoom-gallery role="region" aria-roledescription="carousel" aria-label="Tour">',
    );
    expect(html.match(/class="cc-slide"/g)).toHaveLength(3);
    expect(html).toContain(
      '<div class="cc-slide" role="group" aria-roledescription="slide" aria-label="2 of 3" data-zoom tabindex="0">',
    );
    expect(html.match(/class="cc-dot"/g)).toHaveLength(3);
    expect(html).toContain('data-carousel-step="-1" aria-label="Previous slide" disabled');
    // One zoom script and one carousel script, even with an image that zooms on its own.
    expect(html.match(/<script>/g)).toHaveLength(2);
  });

  it("keeps explicit slides and their titles", async () => {
    const html = await render(
      '::carousel\n:::slide{title="First"}\nOne\n\nStill one\n:::\n\n:::slide\nTwo\n:::\n::',
    );
    expect(html.match(/class="cc-slide"/g)).toHaveLength(2);
    expect(html).toContain(
      'aria-label="1 of 2" data-zoom tabindex="0" data-zoom-title="First"><p>One</p>',
    );
    expect(html).toContain("<p>Still one</p>");
  });

  it("shows several columns, and marks slides that all fit so wide pages hide the controls", async () => {
    const html = await render("::carousel{columns=2}\nOne\n\nTwo\n::");
    expect(html).toContain('<div class="cc" data-columns="2" data-fits data-zoom-gallery');
    expect(html).toContain('<div class="cc-controls">');
    expect(await render("::carousel\nOnly one\n::")).not.toContain('<div class="cc-controls">');
  });

  it("can turn zoom off", async () => {
    const html = await render("::carousel{zoom=false}\nOne\n\nTwo\n::");
    expect(html).not.toContain("data-zoom");
    expect(html.match(/<script>/g)).toHaveLength(1);
  });
});

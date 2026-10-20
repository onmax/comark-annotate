import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import security from "comark/plugins/security";
import { describe, expect, it } from "vite-plus/test";
import annotate, { components } from "../src/html.ts";
import { css } from "../src/styles.ts";

async function run(markdown: string) {
  const document = await parseMarkdown(markdown, { plugins: [annotate()] });
  return {
    issues: document.meta.annotateIssues,
    html: await renderHtmlFromDocument(document, { components }),
    document,
  };
}

const compare = `
::compare
:::screenshot{src="before.png" alt="Old toolbar" viewport="900x360"}
::::annotation{x=10 y=20 w=30 h=15}
Filters **wrap**.
::::
:::

:::screenshot{src="after.png" alt="New toolbar" url="https://pr2.example.com/plan" viewport="900x360"}
::::annotation{x=50 y=20 w=10 h=10 mark="check" color="#16a34a"}
One row.
::::
:::
::
`;

describe("comark-annotate", () => {
  it("renders a compare with numbered marks and linked notes", async () => {
    const { issues, html } = await run(compare);
    expect(issues).toEqual([]);
    expect(html).toContain('<img src="before.png" alt="Old toolbar"');
    expect(html).toContain('style="left:10%;top:20%;width:30%;height:15%"');
    expect(html).toMatch(
      /<span class="ca-mark ca-check" data-n="2" role="img" aria-label="Annotation 2: /,
    );
    expect(html).toMatch(/<li id="ca-[a-z0-9]+-1" data-n="1">.*Filters <strong>wrap<\/strong>\./);
    expect(html).toContain('<span class="ca-label">Before</span>');
    expect(html).toContain(
      '<span class="ca-label">After</span> <a href="https://pr2.example.com/plan" title="https://pr2.example.com/plan">Preview</a>',
    );
    expect(html).toMatch(
      /<figure class="ca-screenshot" data-zoom tabindex="0" data-zoom-title="Before"><div class="ca-heading"><span class="ca-label">Before<\/span><\/div><div class="ca-stage">/,
    );
    expect(html).not.toMatch(/<figcaption><div class="ca-heading">/);
    // Side by side on a wide page, one at a time on a narrow one, and both zoom as one gallery.
    expect(html).toContain(
      '<div class="ca ca-compare"><div class="cc" data-carousel-columns="2" data-carousel-fits data-zoom-gallery',
    );
    expect(html.match(/class="cc-slide"/g)).toHaveLength(2);
  });

  it("lays a slider's screenshots over each other, with a handle to drag and every note listed", async () => {
    const { issues, html } = await run(
      compare
        .replace("::compare", '::compare{mode="slider"}')
        .replace("x=10 y=20 w=30 h=15}", 'x=10 y=20 w=30 h=15 side="left"}'),
    );
    expect(issues).toEqual([]);
    expect(html).toContain(
      '<div class="ca ca-compare ca-slider"><div class="ca-swipe" data-zoom tabindex="0" data-zoom-title="Before / After"><div class="ca-side ca-side-before"><div class="ca-heading"><span class="ca-label">Before</span></div><div class="ca-stage"><div class="ca-frame"><img src="before.png"',
    );
    expect(html).toContain('<div class="ca-side ca-side-after">');
    expect(html).toContain(
      '<div class="ca-handle" role="slider" tabindex="0" aria-label="Divider between Before and After" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="Before 50%, After 50%">',
    );
    // A side note would point across the divider, so it joins the numbered list.
    expect(html).not.toContain('class="ca-callout');
    expect(html).not.toContain('class="ca-arrow');
    expect(html).toMatch(
      /<div class="ca-side-notes ca-notes-before">.*<span class="ca-stamp">1<\/span><div>Filters/,
    );
    expect(html).toMatch(
      /<div class="ca-side-notes ca-notes-after">.*<span class="ca-stamp">2<\/span><div>One row/,
    );
    expect(html).not.toContain('class="cc"');
    expect(html.match(/__comarkAnnotate/g)?.length).toBeGreaterThan(0);
  });

  it("carries the slider script once per render", async () => {
    const slider = compare.replace("::compare", '::compare{mode="slider"}');
    const { html } = await run(`${slider}\n${slider.replaceAll(".png", "-2.png")}`);
    expect(html.match(/<div class="ca-swipe"/g)).toHaveLength(2);
    expect(html.match(/<script>\(function start\(\) \{/g)).toHaveLength(1);
  });

  it("inlines the styles once per render and keeps ids stable and unique", async () => {
    const { document } = await run(
      `${compare}\n::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\nNote\n:::\n::\n\n::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\nAgain\n:::\n::`,
    );
    const first = await renderHtmlFromDocument(document, { components });
    const second = await renderHtmlFromDocument(document, { components });
    expect(first).toBe(second);
    expect(first.match(/<style>/g)).toHaveLength(1);
    const ids = [...first.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("styles only the notes themselves, so a list inside a note keeps its bullets", () => {
    expect(css).toContain(".ca-notes>li{display:flex");
    expect(css).not.toMatch(/\.ca-notes li\b/);
  });

  it("lets Comark's security plugin clean notes", async () => {
    const source = `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\nNote <img src="x" onerror="alert(1)"> <script>alert(2)</script>\n:::\n::`;
    const document = await parseMarkdown(source, {
      plugins: [annotate(), security({ blockedTags: ["script"] })],
    });
    const html = await renderHtmlFromDocument(document, { components });
    expect(html).toContain('<img src="x">');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(2)");
  });

  it("moves side notes beside the image with an arrow and keeps the rest in the list", async () => {
    const { issues, html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=10 y=10 w=10 h=10 side="right"}\nBeside\n:::\n:::annotation{x=50 y=50 w=10 h=10}\nListed\n:::\n::`,
    );
    expect(issues).toEqual([]);
    expect(html).toContain('class="ca-screenshot ca-right"');
    expect(html).toMatch(/class="ca-arrow ca-arrow-right" data-n="1" style="top:15%;left:20%;/);
    expect(html).toMatch(
      /class="ca-callout ca-callout-right" id="ca-[a-z0-9]+-1" data-n="1"[^>]*><span class="ca-stamp ca-letter">A<\/span><div>Beside/,
    );
    expect(html).toContain('aria-label="Side note: Beside"');
    expect(html).toContain('<span class="ca-stamp">1</span></span>');
    expect(html).toMatch(/<ol class="ca-notes"><li id="ca-[a-z0-9]+-2" data-n="2">.*Listed/);
  });

  it("keeps both images of a comparison level when only one has a note above it", async () => {
    const { html } = await run(
      `::compare\n:::screenshot{src="a.png" alt="A"}\n::::annotation{x=40 y=50 w=20 h=10 mark="none" side="top"}\nAbove.\n::::\n:::\n\n:::screenshot{src="b.png" alt="B"}\n:::\n::`,
    );
    expect(html.match(/class="ca-screenshot ca-top"/g)).toHaveLength(2);
  });

  it("points from a note above the image without drawing a mark", async () => {
    const { issues, html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=40 y=50 w=20 h=10 mark="none" side="top"}\nStart with what failed.\n:::\n::`,
    );
    expect(issues).toEqual([]);
    expect(html).toContain('class="ca-screenshot ca-top"');
    expect(html).toMatch(
      /class="ca-arrow ca-arrow-top" data-n="1" style="left:50%;top:calc\(-1 \* var\(--ca-gap\)\);bottom:50%"/,
    );
    expect(html).toContain('class="ca-mark ca-none"');
    expect(html).not.toMatch(/ca-mark ca-none"[^>]*><svg[^>]*><path/);
    expect(html).toContain('title="Start with what failed."');
  });

  it("maps named colors to the palette and passes hex through", async () => {
    const { html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 color="amber"}\nA\n:::\n:::annotation{x=50 y=50 w=10 h=10 color="#123456"}\nB\n:::\n::`,
    );
    expect(html).toContain(
      "--ca-color:var(--ca-amber);--ca-solid:var(--ca-amber-solid);--ca-ink:var(--ca-amber-ink);",
    );
    expect(html).toContain("--ca-color:#123456;--ca-solid:#123456;");
  });

  it("reads props from YAML blocks and bindings", async () => {
    const { issues, html } = await run(
      '::screenshot{src="a.png" alt="A"}\n:::annotation\n```yaml [props]\nx: 10\ny: 20\nw: 30\nh: 15\nside: right\n```\nFrom YAML\n:::\n:::annotation{:x="40" :y="40" :w="10" :h="10"}\nBound\n:::\n::',
    );
    expect(issues).toEqual([]);
    expect(html).toContain("left:10%;top:20%;width:30%;height:15%");
    expect(html).toContain("left:40%;top:40%;width:10%;height:10%");
    expect(html).toContain("ca-callout-right");
  });

  it("leaves props bound to render-time data to the renderer", async () => {
    const markdown = `::screenshot{src="a.png" alt="A"}\n:::annotation{:x="data.box.x" :y="data.box.y" w=10 h=10}\nNote\n:::\n::`;
    const document = await parseMarkdown(markdown, { plugins: [annotate()] });
    expect(document.meta.annotateIssues).toEqual([]);
    const html = await renderHtmlFromDocument(document, {
      components,
      data: { box: { x: 30, y: 40 } },
    });
    expect(html).toContain("left:30%;top:40%;width:10%;height:10%");
  });

  it("reports inherited object keys as marks instead of crashing", async () => {
    const { issues, html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=1 y=1 w=10 h=10 mark="toString"}\nNote\n:::\n::`,
    );
    expect((issues as string[]).join("\n")).toContain("`mark` must be one of");
    expect(html).toContain("ca-mark ca-box");
  });

  it.each([
    [`::screenshot{src="a.png"}\n::`, "`alt` is required"],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=95 y=0 w=10 h=10}\nNote\n:::\n::`,
      "runs past the image edge",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10}\nNote\n:::\n::`,
      "`h` must be a percentage",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 mark="star"}\nNote\n:::\n::`,
      "`mark` must be one of",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\n:::\n::`,
      "write a note",
    ],
    [
      `::screenshot{src="a.png" alt="A" url="javascript:alert(1)"}\n::`,
      "`url` must start with http",
    ],
    [`::compare\n:::screenshot{src="a.png" alt="A"}\n:::\n::`, "needs exactly two screenshots"],
    [compare.replace('viewport="900x360"', 'viewport="1440x900"'), "different viewports"],
    [
      compare.replace("::compare", '::compare{mode="swipe"}'),
      '`mode` must be columns or slider (got "swipe")',
    ],
    [`::annotation{x=0 y=0 w=10 h=10}\nNote\n::`, "must be inside a screenshot"],
    [
      `::screenshot{src="a.png" alt="A"}\n> :::annotation{x=0 y=0 w=10 h=10}\n> Note\n> :::\n::`,
      "Annotations must be direct children of a screenshot",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\n<!-- todo -->\n:::\n::`,
      "write a note",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 color="gren"}\nNote\n:::\n::`,
      "`color` must be",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 side="up"}\nNote\n:::\n::`,
      "`side` must be left, right, or top",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=10 w=10 h=10 side="left"}\nA\n:::\n:::annotation{x=0 y=15 w=10 h=10 side="left"}\nB\n:::\n::`,
      "would overlap",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=10 y=50 w=10 h=10 side="top"}\nA\n:::\n:::annotation{x=20 y=50 w=10 h=10 side="top"}\nB\n:::\n::`,
      "top notes for annotations 1 and 2 would overlap",
    ],
  ])("reports %#: %s", async (markdown, issue) => {
    const { issues } = await run(markdown);
    expect((issues as string[]).join("\n")).toContain(issue);
  });

  it("escapes attributes and drops unsafe links", async () => {
    const { html } = await run(
      `::screenshot{src='a.png" onerror="x' alt="<b>" url="javascript:alert(1)"}\n::`,
    );
    expect(html).toContain('src="a.png&quot; onerror=&quot;x"');
    expect(html).toContain('alt="&lt;b&gt;"');
    expect(html).not.toContain("javascript:");
    const { html: lookalike } = await run(
      `::screenshot{src="a.png" alt="A" url="httpx:alert(1)"}\n::`,
    );
    expect(lookalike).not.toContain("<a href");
    const { issues, html: upper } = await run(
      `::screenshot{src="a.png" alt="A" url="HTTPS://x.com"}\n::`,
    );
    expect(issues).toEqual([]);
    expect(upper).toContain('<a href="HTTPS://x.com" title="HTTPS://x.com">Preview</a>');
  });

  it("checks and renders files from the CLI", async () => {
    const dir = await mkdtemp(join(tmpdir(), "comark-annotate-"));
    const cli = (...args: string[]) =>
      promisify(execFile)(process.execPath, [
        new URL("../src/cli.ts", import.meta.url).pathname,
        ...args,
      ]);
    await writeFile(
      join(dir, "ok.md"),
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=1 y=1 w=5 h=5}\nNote\n:::\n::`,
    );
    await writeFile(join(dir, "bad.md"), `::screenshot{src="a.png"}\n::`);
    expect((await cli("check", join(dir, "ok.md"))).stdout).toContain("No problems.");
    await expect(cli("check", join(dir, "bad.md"))).rejects.toMatchObject({ code: 1 });
    await cli("render", join(dir, "ok.md"));
    expect(await readFile(join(dir, "ok.html"), "utf8")).toContain('class="ca-mark ca-box"');
  });
});

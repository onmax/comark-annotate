import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import { describe, expect, it } from "vite-plus/test";
import annotate, { components } from "../src/html.ts";

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
    expect(html).toMatch(/class="ca-mark ca-check" data-n="2" href="#ca1-2"/);
    expect(html).toMatch(/<li id="ca1-1" data-n="1">.*Filters <strong>wrap<\/strong>\./);
    expect(html).toContain('<span class="ca-label">Before</span>');
    expect(html).toContain(
      '<span class="ca-label">After</span> <a href="https://pr2.example.com/plan">pr2.example.com/plan</a>',
    );
  });

  it("inlines the styles once per render, including repeat renders of one document", async () => {
    const { document } = await run(
      `${compare}\n::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10}\nNote\n:::\n::`,
    );
    for (let i = 0; i < 2; i++) {
      const html = await renderHtmlFromDocument(document, { components });
      expect(html.match(/<style>/g)).toHaveLength(1);
      expect(html).toContain('id="ca2-');
    }
  });

  it("moves side notes beside the image with an arrow and keeps the rest in the list", async () => {
    const { issues, html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=10 y=10 w=10 h=10 side="right"}\nBeside\n:::\n:::annotation{x=50 y=50 w=10 h=10}\nListed\n:::\n::`,
    );
    expect(issues).toEqual([]);
    expect(html).toContain('class="ca-screenshot ca-right"');
    expect(html).toMatch(/class="ca-arrow ca-arrow-right" data-n="1" style="top:15%;left:20%;/);
    expect(html).toMatch(
      /class="ca-callout ca-callout-right" id="ca1-1" data-n="1"[^>]*><div>Beside/,
    );
    expect(html).toContain('<span class="ca-stamp">1</span></a>');
    expect(html).toMatch(/<ol class="ca-notes"><li id="ca1-2" data-n="2">.*Listed/);
  });

  it("maps named colors to the palette and passes hex through", async () => {
    const { html } = await run(
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 color="amber"}\nA\n:::\n:::annotation{x=50 y=50 w=10 h=10 color="#123456"}\nB\n:::\n::`,
    );
    expect(html).toContain("--ca-color:var(--ca-amber);--ca-ink:var(--ca-amber-ink);");
    expect(html).toContain("--ca-color:#123456;");
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
    [`::annotation{x=0 y=0 w=10 h=10}\nNote\n::`, "must be inside a screenshot"],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=0 w=10 h=10 side="up"}\nNote\n:::\n::`,
      "`side` must be left or right",
    ],
    [
      `::screenshot{src="a.png" alt="A"}\n:::annotation{x=0 y=10 w=10 h=10 side="left"}\nA\n:::\n:::annotation{x=0 y=15 w=10 h=10 side="left"}\nB\n:::\n::`,
      "would overlap",
    ],
  ])("reports %#: %s", async (markdown, issue) => {
    const { issues } = await run(markdown);
    expect(issues.join("\n")).toContain(issue);
  });

  it("escapes attributes and drops unsafe links", async () => {
    const { html } = await run(
      `::screenshot{src='a.png" onerror="x' alt="<b>" url="javascript:alert(1)"}\n::`,
    );
    expect(html).toContain('src="a.png&quot; onerror=&quot;x"');
    expect(html).toContain('alt="&lt;b&gt;"');
    expect(html).not.toContain("javascript:");
  });
});

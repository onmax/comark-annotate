import { createHtmlRenderer } from "@comark/html";
import { parseMarkdown } from "comark";
import { describe, expect, it } from "vite-plus/test";
import metrics, { components } from "../src/html.ts";

const render = createHtmlRenderer({ plugins: [metrics()], components });
const issues = async (markdown: string) =>
  (await parseMarkdown(markdown, { plugins: [metrics()] })).meta.issues;
const stats = (rows: string[], props = "") =>
  `::stats${props}\n| Metric | Before | After |\n| --- | --- | --- |\n${rows.join("\n")}\n::`;

describe("comark-metrics", () => {
  it("shows a delta as before → after with the change, colored by `better`, and inlines the styles once", async () => {
    const html = await render(
      'JS :delta{from=412 to=388 unit="kB" better="lower"}, LCP :delta{from=2.4 to=2.9 unit="s" better="lower"}',
    );
    expect(html).toContain(
      '<span class="cmt-delta" data-direction="down" data-verdict="better"><span class="cmt-from">412 kB</span> → <span class="cmt-to">388 kB</span> <span class="cmt-change">↓ 5.8%</span></span>',
    );
    expect(html).toContain('data-direction="up" data-verdict="worse"');
    expect(html).toContain('<span class="cmt-change">↑ 20.8%</span>');
    expect(html.match(/<style data-comark-metrics>/g)).toHaveLength(1);
  });

  it("is neutral without `better` or a change, and shows the difference from zero", async () => {
    expect(await render(":delta{from=10 to=12}")).toContain(
      'data-direction="up" data-verdict="neutral"><span class="cmt-from">10</span> → <span class="cmt-to">12</span> <span class="cmt-change">↑ 20%</span>',
    );
    expect(await render(':delta{from=3 to=3 better="higher"}')).toContain(
      'data-direction="same" data-verdict="neutral"',
    );
    expect(await render(':delta{from=0 to=1.5 unit="s"}')).toContain(
      '<span class="cmt-change">↑ 1.5 s</span>',
    );
    expect(await render(':delta{from=80 to=92 unit="%" better="higher"}')).toContain(
      '<span class="cmt-from">80%</span> → <span class="cmt-to">92%</span> <span class="cmt-change">↑ 15%</span>',
    );
  });

  it("draws a progress bar with its percent and label", async () => {
    expect(await render(':progress{value=0.85 label="Tests migrated"}')).toContain(
      '<span class="cmt-progress"><span class="cmt-label">Tests migrated</span><progress value="0.85" max="1" aria-label="Tests migrated">85%</progress><span class="cmt-percent">85%</span></span>',
    );
    expect(await render(":progress{value=17 max=20}")).toContain(
      '<progress value="17" max="20">85%</progress>',
    );
  });

  it("leaves a raw <progress> alone", async () => {
    const html = await render('<progress value="3" max="4"></progress>');
    expect(html).toContain('<progress value="3" max="4"></progress>');
    expect(html).not.toContain("cmt-");
  });

  it("adds a change column to a ::stats table", async () => {
    const html = await render(
      stats(["| JS | 412 kB | 388 kB |", "| Requests | 1,204 | 1,310 |"], '{better="lower"}'),
    );
    expect(html).toContain('<table class="cmt-stats">');
    expect(html).toMatch(/<th>After<\/th>\s*<th>Change<\/th>/);
    expect(html).toContain('data-verdict="better"><span class="cmt-change">↓ 5.8%</span>');
    expect(html).toContain('data-verdict="worse"><span class="cmt-change">↑ 8.8%</span>');
  });

  it("reports what it can't read", async () => {
    expect(await issues(':delta{from="big" to=3}')).toEqual([
      '`:delta` 1: `from="big"` isn\'t a number. Write the number alone and the unit in `unit`, such as `from=412 unit="kB"`.',
    ]);
    expect(await issues(":delta{to=3}")).toEqual([
      "`:delta` 1: `from` is required. Write `:delta{from=412 to=388}`.",
    ]);
    expect(await issues(':delta{from=1 to=2 better="smaller"}')).toEqual([
      '`:delta` 1: `better` must be `lower` or `higher`, such as `better="lower"` for a size or a duration.',
    ]);
    expect(await issues(":progress{value=85}")).toEqual([
      "`:progress` 1: `value=85` is outside 0 to 1, so the bar was clamped. Write a fraction such as `value=0.85`, or set `max=100`.",
    ]);
    expect(await issues(":progress")).toEqual([
      "`:progress` 1: `value` is required. Write `:progress{value=0.85}`.",
    ]);
    expect(
      await issues(
        stats([
          "| Score | 88 | n/a |",
          "| Size | 1.2 MB | 900 kB |",
          "| Missing unit | 1 MB | 900 |",
        ]),
      ),
    ).toEqual([
      '`::stats` 1, row "Score": "n/a" isn\'t a number, so it has no change. Write a number with an optional unit, such as `412 kB`.',
      '`::stats` 1, row "Size": before is in MB and after in kB. Write both in the same unit.',
      '`::stats` 1, row "Missing unit": before is in MB and after in no unit. Write both in the same unit.',
    ]);
    expect(await issues("::stats\nNo table here.\n::")).toEqual([
      "`::stats` 1 has no table. Put a Markdown table between `::stats` and `::`, with a name, a before, and an after column.",
    ]);
    expect(await issues("::stats\n| A | B |\n| - | - |\n| 1 | 2 |\n::")).toEqual([
      "`::stats` 1: its table has 2 columns, but needs 3: a name, a before, and an after value. Move other columns to a table of their own.",
    ]);
  });

  it("rejects malformed grouping", async () => {
    expect(await issues(":delta{from=1,2 to=3}")).toEqual([
      '`:delta` 1: `from="1,2"` isn\'t a number. Write the number alone and the unit in `unit`, such as `from=412 unit="kB"`.',
    ]);
    expect(await issues(stats(["| Bad | 1,2 | 3 |"]))).toEqual([
      '`::stats` 1, row "Bad": "1,2" isn\'t a number, so it has no change. Write a number with an optional unit, such as `412 kB`.',
    ]);
  });

  it("names each issue's rule, and reports a prop it doesn't read", async () => {
    const { meta } = await parseMarkdown(
      ':delta{from=1 to=2 beter="lower"} :progress{value=85}\n\n' +
        stats(["| Photo | 1.2 MB | 800 kB |"]),
      { plugins: [metrics()] },
    );
    expect(meta.issueRules).toEqual({
      "`:delta` 1: `beter` isn't a prop of `:delta`, so it's ignored. Use `from`, `to`, `unit`, or `better`.":
        "comark/metrics/unknown-prop",
      "`:progress` 1: `value=85` is outside 0 to 1, so the bar was clamped. Write a fraction such as `value=0.85`, or set `max=100`.":
        "comark/metrics/value-out-of-range",
      '`::stats` 1, row "Photo": before is in MB and after in kB. Write both in the same unit.':
        "comark/metrics/unit-mismatch",
    });
  });

  it("escapes what it writes", async () => {
    expect(await render(':delta{from=1 to=2 unit="<b>"}')).toContain("1 &lt;b&gt;");
  });
});

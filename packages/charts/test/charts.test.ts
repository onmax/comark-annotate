import { createHtmlRenderer } from "@comark/html";
import { parseMarkdown } from "comark";
import annotate, { components as annotateComponents } from "comark-annotate/html";
import { describe, expect, it } from "vite-plus/test";
import charts, { components } from "../src/html.ts";

const render = createHtmlRenderer({ plugins: [charts()], components });
const issues = async (markdown: string) =>
  (await parseMarkdown(markdown, { plugins: [charts()] })).meta.issues;
const chart = (table: string, props = "") => `::chart${props}\n${table.trim()}\n::`;

const sizes = `
| package | size (kB) |
| --- | --: |
| annotate | 41.2 |
| zoom | 18.1 |
| lint | 27.5 |`;
const months = `
| month | before | after |
| --- | --: | --: |
| 2026-04 | 820 | 610 |
| 2026-05 | 1,020 | 598 |
| 2026-06 | 990 | 640 |`;

describe("comark-charts", () => {
  it("draws an SVG over the table it came from, and inlines the styles once", async () => {
    const html = await render(`${chart(sizes, '{title="Bundle size"}')}\n\n${chart(months)}`);
    expect(html).toContain(
      '<figure class="cch" data-type="bar"><figcaption>Bundle size</figcaption><div class="cch-plot"><svg role="img" aria-label="Bundle size" xmlns="http://www.w3.org/2000/svg"',
    );
    // Names on x make bars; dates make lines.
    expect(html).toContain(
      '<figure class="cch" data-type="line"><div class="cch-plot"><svg role="img" aria-label="line chart of before, after by month"',
    );
    expect(html).toContain('<details class="cch-data"><summary>Data</summary><table>');
    expect(html).toContain("<td>annotate</td>");
    expect(html.match(/<style data-comark-charts>/g)).toHaveLength(1);
    expect(await issues(chart(sizes))).toEqual([]);
  });

  it("takes the card's side padding from --cch-padding, which the Data footer spans too", async () => {
    const html = await render(chart(sizes));
    expect(html).toContain(":where(.cch){--cch-padding:1.5rem}");
    expect(html).toMatch(/\.cch\{[^}]*padding:1\.25rem var\(--cch-padding\) 0;/);
    expect(html).toMatch(
      /\.cch-data\{margin:1rem calc\(-1 \* var\(--cch-padding\)\) 0;padding:\.75rem var\(--cch-padding\);/,
    );
  });

  it("labels the chart with the table's own headers, dots and all", async () => {
    const html = await render(
      chart(`
| phase | v0.1 | v0.2 |
| --- | --- | --- |
| parse | 120 | 80 |
| render | 160 | 102 |`),
    );
    expect(html).toContain(">v0.1</text>");
    expect(html).toContain(">v0.2</text>");
    expect(html).toContain(">parse</text>");
  });

  it("draws the columns `x` and `y` name, as a line, an area, or a pie", async () => {
    const line = await render(chart(months, '{x="month" y="after"}'));
    expect(line).toContain('aria-label="line chart of after by month"');
    expect(line).not.toContain(">before</text>");
    expect(await render(chart(months, '{type="area"}'))).toContain('data-type="area"');
    const pie = await render(chart(sizes, '{type="pie"}'));
    expect(pie).toContain('data-type="pie"');
    expect(pie).toContain(">annotate</text>");
  });

  it("stacks bars, plots numbers against numbers, joins before and after, and walks a total", async () => {
    const stacked = await render(
      chart(
        `
| page | js | css |
| --- | --- | --- |
| home | 120 | 18 |
| docs | 95 | 22 |`,
        '{type="stacked"}',
      ),
    );
    expect(stacked).toContain('data-type="stacked"');
    expect(stacked).toContain(">css</text>");
    const scatter = await render(
      chart(
        `
| size (kB) | load (ms) |
| --- | --- |
| 40 | 210 |
| 120 | 410 |`,
        '{type="scatter"}',
      ),
    );
    expect(scatter).toContain('data-type="scatter"');
    expect(scatter).toContain(">size (kB)</text>");
    const dumbbell = await render(chart(months, '{type="dumbbell"}'));
    expect(dumbbell).toContain('data-type="dumbbell"');
    expect(dumbbell).toContain(">before</text>");
    expect(dumbbell).toContain(">after</text>");
    const waterfall = await render(
      chart(
        `
| step | size |
| --- | --- |
| main | 412 |
| add charts | 38 |
| drop moment | -24 |
| this PR | 426 |`,
        '{type="waterfall"}',
      ),
    );
    expect(waterfall).toContain('data-type="waterfall"');
    expect(waterfall).toContain(">increase</text>");
    expect(waterfall).toContain(">decrease</text>");
  });

  it("turns bars sideways when their labels are long, keeping every label whole", async () => {
    const label = "packages/annotate/test/diff.test.ts › renders rows";
    const html = await render(
      chart(`| test | s |\n| --- | --- |\n| ${label} | 1.3 |\n| zoom | 5.1 |`),
    );
    expect(html).toContain(`>${label}</text>`);
    const [, width] = /viewBox="0 0 ([\d.]+) /.exec(html) ?? [];
    expect(Number(width)).toBeLessThanOrEqual(700);
  });

  it("draws comark-annotate marks on the row and series an annotation names", async () => {
    const markdown = `::chart{title="Build time"}
${months.trim()}
:::annotation{at="2026-05" series="before" mark="circle" color="red"}
The slow month.
:::
:::annotation{at="2026-06" side="top" mark="none"}
Cache on.
:::
::`;
    const both = [charts(), annotate()];
    expect((await parseMarkdown(markdown, { plugins: both })).meta.issues).toEqual([]);
    const html = await createHtmlRenderer({
      plugins: both,
      components: { ...annotateComponents, ...components },
    })(markdown);
    expect(html).toContain('<div class="cch-plot cch-marked">');
    expect(html).toMatch(
      /<span class="ca-mark ca-circle[^"]*" data-n="1"[^>]*left:[\d.]+%;top:[\d.]+%/,
    );
    expect(html).toContain('class="ca-callout ca-callout-top"');
    expect(html).toContain("The slow month.");
    // The data stays the table, marks or not.
    expect(html).toContain('<details class="cch-data"><summary>Data</summary><table>');
  });

  it("places chart stamps using the SVG aspect ratio", async () => {
    const markdown = `::chart{type="pie"}
| name | n |
| --- | --- |
| a | 1 |
| b | 2 |
:::annotation{at="a" mark="circle"}
The first slice.
:::
::`;
    const html = await createHtmlRenderer({
      plugins: [charts(), annotate()],
      components: { ...annotateComponents, ...components },
    })(markdown);
    expect(html).toContain('viewBox="0 0 544 376"');
    expect(html).toContain('ca-stamp" style="right:calc(100% + 4px);bottom:calc(100% + 4px)"');
  });

  it("reports an annotation that points at no row or series", async () => {
    const markdown = `::chart
${months.trim()}
:::annotation{at="2026-13" x=10}
Nowhere.
:::
:::annotation{at="2026-05" series="during"}
No such column.
:::
:::annotation
:::
::`;
    expect(await issues(markdown)).toEqual([
      "`::chart` 1, annotation 1: `x` isn't a prop of an annotation in a chart. Point at a row with `at`, and a column with `series`.",
      '`::chart` 1, annotation 1: `at="2026-13"` isn\'t a `month` in the table. Copy it from the table, such as `2026-04`, `2026-05`, `2026-06`.',
      '`::chart` 1, annotation 2: `series="during"` isn\'t a column the chart draws. Use `before` or `after`, or leave it out to mark the whole row.',
      "`::chart` 1, annotation 3: write a note explaining what the mark points at.",
      "`::chart` 1, annotation 3: `at` is required: the `month` of the row it marks, one of `2026-04`, `2026-05`, `2026-06`.",
    ]);
    const html = await render(markdown);
    expect(html.match(/class="ca-mark /g)).toHaveLength(1);
  });

  it("escapes text from the table in the SVG", async () => {
    const html = await render(
      chart(`
| name | n |
| --- | --- |
| a & "b" \\<i\\> | 1 |
| c | 2 |`),
    );
    expect(html).not.toContain("<i>");
    expect(html).toContain("a &amp; ");
  });

  it("reports each problem, naming the block and the fix, and still draws what it can", async () => {
    const markdown = [
      chart(sizes, '{type="donut" colour="red"}'),
      chart(months, '{y="befor"}'),
      chart(`
| package | size |
| --- | --- |
| annotate | 41 kB |
| zoom | 18 |`),
      chart(months, '{type="pie"}'),
      "::chart\nJust text.\n::",
      chart(sizes, '{type="scatter"}'),
      chart(sizes, '{type="dumbbell"}'),
      chart(months, '{type="waterfall"}'),
    ].join("\n\n");
    expect(await issues(markdown)).toEqual([
      "`::chart` 1: `colour` isn't a prop of `::chart`. Valid props: type, x, y, title.",
      '`::chart` 1: `type="donut"` isn\'t a chart type. Use `bar`, `stacked`, `line`, `area`, `scatter`, `dumbbell`, `waterfall` or `pie`.',
      '`::chart` 2: `y` names column `befor`, but its table has `month`, `before` and `after`. Separate several with commas, as in `y="before, after"`.',
      "`::chart` 3: row 1 has `41 kB` in `size`, which isn't a number. Write the number alone, such as `1200` or `1,200`, and put the unit in the header, such as `size (ms)`.",
      '`::chart` 4: a pie shows one column of numbers, and this one has `before` and `after`. Name one with `y`, or use `type="bar"`.',
      "`::chart` 5 has no table to draw. Put a Markdown table between `::chart` and `::`: a header row, then one row per point.",
      '`::chart` 6: a scatter plot needs numbers in `package`, its `x`. Use `type="bar"`, or make `x` a column of numbers.',
      '`::chart` 7: a dumbbell joins two or more columns of numbers per row, such as `before` and `after`, and this one has `size (kB)`. Add a column, or use `type="bar"`.',
      '`::chart` 8: a waterfall shows one column of numbers, and this one has `before` and `after`. Name one with `y`, or use `type="bar"`.',
    ]);
    const html = await render(markdown);
    // An unknown or unfit type falls back to the default, a bad cell is left out, and a pie or a waterfall draws its
    // first column. A missing column leaves nothing to draw.
    expect(html.match(/<svg role="img"/g)).toHaveLength(6);
    expect(html).toContain("Just text.");
  });

  it("reports a repeated x, a line of one row, and a pie of zeros, and draws bars instead", async () => {
    const markdown = [
      chart(
        `| month | ms |\n| --- | --- |\n| 2026-04 | 820 |\n| 2026-05 | 890 |\n| 2026-04 | 905 |`,
      ),
      chart(`| month | ms |\n| --- | --- |\n| 2026-04 | 820 |`, '{type="line"}'),
      chart(`| name | n |\n| --- | --- |\n| a | 0 |\n| b | |`, '{type="pie"}'),
    ].join("\n\n");
    expect(await issues(markdown)).toEqual([
      "`::chart` 1: rows 1 and 3 both have `2026-04` in `month`. Give each row its own `month`, or add the rows up into one.",
      '`::chart` 2: a line needs at least two rows to draw, and this one has one. Add a row, or use `type="bar"`.',
      '`::chart` 3: a pie of `n` has nothing to divide, since every number is 0 or empty. Use `type="bar"`, or check the numbers.',
    ]);
    expect((await render(markdown)).match(/data-type="bar"/g)).toHaveLength(2);
  });

  it("gives every grouped bar over dates its own lane", async () => {
    const html = await render(
      chart(
        `
| year | before | after | p95 | p99 | mobile | desktop |
| --- | --: | --: | --: | --: | --: | --: |
| 2015 | 20 | 10 | 7 | 9 | 4 | 12,000 |
| 2016 | 10 | 12 | 18 | 19 | 9 | 19 |`,
        '{type="bar"}',
      ),
    );
    const bars = [...html.matchAll(/<path d="(M[^"]*)" fill="#[0-9a-f]{6}"/g)].map(([, d]) => d);
    expect(bars).toHaveLength(12);
    expect(bars.filter((d) => /^M[\d.]+,[\d.]+h0v/.test(d))).toEqual([]);
  });

  it("renders the content as it is when there's nothing to draw", async () => {
    const html = await render(chart(months, '{x="day"}'));
    expect(html).not.toContain("cch");
    expect(html).toContain("<td>2026-04</td>");
  });
});

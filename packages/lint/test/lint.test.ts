import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import annotate, { components } from "comark-annotate/html";
import { describe, expect, it } from "vite-plus/test";
import { runProjectFixture } from "vite-doctor/testkit";
import { lint } from "../src/index.ts";
import comark from "../src/doctor.ts";

const options = { plugins: [annotate()], components };
const check = async (markdown: string) =>
  (await lint(markdown, options)).map(({ rule, line, column, message, fix }) => ({
    rule,
    line,
    column,
    message: `${message} ${fix}`,
  }));

describe("comark/unclosed-block", () => {
  it("passes closed blocks, nested ones included", async () => {
    expect(
      await check(
        `::compare\n:::screenshot{src="a.png" alt="A"}\n:::\n\n:::screenshot{src="b.png" alt="B"}\n:::\n::`,
      ),
    ).toEqual([]);
  });

  it("reports a block left open, and one an outer closer ends", async () => {
    expect(
      await check(`# Title\n\n::compare\n:::screenshot{src="a.png" alt="A"}\n::\n\n::screenshot`),
    ).toEqual(
      expect.arrayContaining([
        {
          rule: "comark/unclosed-block",
          line: 4,
          column: 1,
          message:
            "`:::screenshot` opened on line 4 is never closed. Add a line with `:::` after its last child.",
        },
        {
          rule: "comark/unclosed-block",
          line: 7,
          column: 1,
          message:
            "`::screenshot` opened on line 7 is never closed. Add a line with `::` after its last child.",
        },
      ]),
    );
  });

  it("ignores `::` inside fenced code", async () => {
    expect(await check("```md\n::compare\n```\n\n~~~\n::screnshot{src=\n~~~\n")).toEqual([]);
  });
});

describe("comark/unknown-component", () => {
  it("passes components from the map and HTML elements", async () => {
    expect(
      await check(`::screenshot{src="a.png" alt="A"}\n::\n\n::div\nText :span[x]\n::`),
    ).toEqual([]);
  });

  it("reports a misspelled block and an inline component, and suggests a known name", async () => {
    const found = await check(`Intro\n\n::screnshot{src="a.png"}\n::\n\nSee :badge[new] here.`);
    expect(found).toEqual([
      {
        rule: "comark/unknown-component",
        line: 3,
        column: 1,
        message:
          "`::screnshot` on line 3 is not a known component. Did you mean `screenshot`? Known: `annotation`, `compare`, `diff`, `screenshot`.",
      },
      {
        rule: "comark/unknown-component",
        line: 6,
        column: 5,
        message:
          "`:badge` on line 6 is not a known component. Known: `annotation`, `compare`, `diff`, `screenshot`. If it is yours, add it to the components you give comark-lint.",
      },
    ]);
  });

  it("is off without components, since any name could be valid", async () => {
    expect(await lint("::anything\n::")).toEqual([]);
  });

  it("takes a list of names as well as a map", async () => {
    expect(await lint("::tabs\n::", { components: ["tabs"] })).toEqual([]);
  });
});

describe("comark/malformed-attributes", () => {
  it("passes closed attributes with quoted braces", async () => {
    expect(
      await check(
        `::screenshot{src="a}.png" alt='A {b}' .wide}\n::\n\n[Link](https://x.com){target="_blank"}`,
      ),
    ).toEqual([]);
  });

  it("reports an unclosed `{` and a key set twice", async () => {
    expect(
      await check(
        `::screenshot{src="a.png" alt="A"\n::\n\n::screenshot{src="a.png" alt="A" src="b.png"}\n::`,
      ),
    ).toEqual([
      {
        rule: "comark/malformed-attributes",
        line: 1,
        column: 13,
        message:
          "`::screenshot` on line 1 opens its attributes with `{` and never closes them. Add `}` after the last attribute. Comark reads the rest of the line as attributes.",
      },
      {
        rule: "comark/malformed-attributes",
        line: 4,
        column: 34,
        message:
          "`::screenshot` on line 4 sets `src` twice. Keep one `src`. Comark uses the last one and drops the others.",
      },
    ]);
  });
});

describe("comark/broken-anchor", () => {
  it("passes links to headings and to `{#id}`", async () => {
    expect(
      await check(`# Install\n\nSee [install](#install) and [box](#box).\n\n**Box**{#box}`),
    ).toEqual([]);
  });

  it("reports a fragment that matches nothing and lists the ids", async () => {
    expect(await check(`# Install\n\n## Usage\n\nSee [usage](#usge).`)).toEqual([
      {
        rule: "comark/broken-anchor",
        line: 5,
        column: 13,
        message:
          "The link to `#usge` on line 5 matches no heading or id in this document. Did you mean `#usage`? Ids here: `#install`, `#usage`. To link somewhere else, add `{#usge}` after the element it should point at.",
      },
    ]);
  });
});

describe("comark/invalid-frontmatter", () => {
  it("passes valid YAML", async () => {
    expect(await check(`---\ntitle: Hello\n---\n\n# Hello`)).toEqual([]);
  });

  it("reports the YAML error's line and still checks the rest", async () => {
    expect(await check(`---\ntitle: Hello\nsummary: a: b\n---\n\n::zoom\nx`)).toEqual([
      {
        rule: "comark/invalid-frontmatter",
        line: 3,
        column: 11,
        message:
          "The frontmatter is not valid YAML: bad indentation of a mapping entry. Indent nested keys evenly, and quote any value that contains `: ` or starts with `*`, `&`, `!`, `[`, or `{`.",
      },
      {
        rule: "comark/unclosed-block",
        line: 6,
        column: 1,
        message:
          "`::zoom` opened on line 6 is never closed. Add a line with `::` after its last child.",
      },
      expect.objectContaining({ rule: "comark/unknown-component", line: 6 }),
    ]);
  });
});

describe("comark/plugin-issue", () => {
  it("passes a document the plugins accept", async () => {
    expect(await check(`::screenshot{src="a.png" alt="A"}\n::`)).toEqual([]);
  });

  it("passes comark-annotate's issues through, on their block's line", async () => {
    expect(
      await check(
        `# Review\n\n::screenshot{src="a.png" alt="A"}\n::\n\n::screenshot{src="b.png"}\n::\n\n::compare\n::`,
      ),
    ).toEqual([
      {
        rule: "comark/plugin-issue",
        line: 6,
        column: 19,
        message: 'screenshot "b.png": `alt` is required. Describe what the screenshot shows.',
      },
      {
        rule: "comark/plugin-issue",
        line: 9,
        column: 1,
        message:
          "compare 1: needs exactly two screenshots, before and after (got 0). Add the missing one.",
      },
    ]);
  });
});

describe("comark/unsafe-url", () => {
  it("passes http, relative, and data: image URLs", async () => {
    expect(
      await check(
        `<a href="https://x.com">x</a> <img src="data:image/png;base64,AAAA" alt="">\n\n::screenshot{src="a.png" alt="A" href="https://x.com"}\n::`,
      ),
    ).toEqual([]);
  });

  it("reports javascript:, vbscript:, and non-image data: URLs", async () => {
    const found = await check(
      `Text\n\n<a href="jav&#x61;script:alert(1)">x</a>\n\n<iframe src="data:text/html,<p>x"></iframe>\n\n:zoom[x]{href="VBScript:x"}`,
    );
    expect(found.map(({ line, message }) => [line, message.split(".")[0]])).toEqual([
      [3, "The `href` of `a` on line 3 is a `javascript:` URL"],
      [5, "The `src` of `iframe` on line 5 is a `data:` URL"],
      [7, "The `href` of `zoom` on line 7 is a `vbscript:` URL"],
    ]);
  });
});

describe("positions", () => {
  it("count the frontmatter in line numbers", async () => {
    const body = "::screnshot\n::";
    expect((await check(body))[0]).toMatchObject({ line: 1 });
    expect((await check(`---\ntitle: A\ndescription: B\n---\n\n${body}`))[0]).toMatchObject({
      line: 6,
    });
  });
});

describe("comark-lint CLI", () => {
  const cli = (...args: string[]) =>
    promisify(execFile)(process.execPath, [
      new URL("../dist/cli.mjs", import.meta.url).pathname,
      ...args,
    ]);

  it("prints file:line:col, the rule, and the fix, and exits with 1 on any problem", async () => {
    const dir = await mkdtemp(join(tmpdir(), "comark-lint-"));
    await writeFile(join(dir, "ok.md"), `::screenshot{src="a.png" alt="A"}\n::\n`);
    await writeFile(join(dir, "bad.md"), `# Title\n\n::compare\n`);
    expect((await cli(join(dir, "ok.md"))).stdout).toBe("No problems.\n");
    await expect(cli(join(dir, "*.md"))).rejects.toMatchObject({
      code: 1,
      stdout: `${join(dir, "bad.md")}:3:1 comark/unclosed-block \`::compare\` opened on line 3 is never closed. Add a line with \`::\` after its last child.\n${join(dir, "bad.md")}:3:1 comark/plugin-issue compare 1: needs exactly two screenshots, before and after (got 0). Add the missing one.\n`,
    });

    const json = await cli(join(dir, "bad.md"), "--format", "json").catch(
      (error: { stdout: string }) => error,
    );
    expect(JSON.parse(json.stdout)).toEqual([
      expect.objectContaining({
        file: join(dir, "bad.md"),
        rule: "comark/unclosed-block",
        line: 3,
      }),
      expect.objectContaining({ rule: "comark/plugin-issue" }),
    ]);

    await expect(cli(join(dir, "missing.md"))).rejects.toMatchObject({
      code: 2,
      stderr: expect.stringContaining(`comark-lint: can't read ${join(dir, "missing.md")}`),
    });
  });

  it("adds a config's components to the installed packages'", async () => {
    const dir = await mkdtemp(join(tmpdir(), "comark-lint-"));
    await writeFile(join(dir, "tabs.md"), `::tabs\n::\n`);
    await writeFile(
      join(dir, "comark-lint.config.mjs"),
      `export default { components: ["tabs"] };\n`,
    );
    await expect(cli(join(dir, "tabs.md"))).rejects.toMatchObject({ code: 1 });
    expect(
      (await cli(join(dir, "tabs.md"), "--config", join(dir, "comark-lint.config.mjs"))).stdout,
    ).toBe("No problems.\n");
  });
});

describe("comark-lint/doctor", () => {
  it("reports Markdown problems as Vite Doctor diagnostics", async () => {
    const result = await runProjectFixture({
      framework: "vite",
      extensions: [comark()],
      files: {
        "docs/page.md": `# Page\n\n::screnshot{src="a.png"}\n::\n\n[Usage](#usage)\n`,
        "docs/ok.mdc": `# Fine\n`,
        "node_modules/x/README.md": `::broken\n`,
      },
    });
    expect(
      result.diagnostics.map((diagnostic) => [
        diagnostic.code,
        diagnostic.ruleId,
        diagnostic.file?.replace(/^.*\/docs\//, "docs/"),
        diagnostic.range?.line,
      ]),
    ).toEqual([
      ["COMARK0002", "comark/unknown-component", "docs/page.md", 3],
      ["COMARK0004", "comark/broken-anchor", "docs/page.md", 6],
    ]);
  });
});

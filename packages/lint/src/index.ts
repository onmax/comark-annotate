import type { ComarkPlugin, ElementNode, MarkdownDocument, Node } from "comark";
import { parseMarkdown } from "comark";
import { htmlTags } from "./html-tags.ts";
import { find, read, type Source } from "./source.ts";

export { defineConfig, resolveConfig, type Config } from "./config.ts";

export type Rule =
  | "comark/unclosed-block"
  | "comark/unknown-component"
  | "comark/malformed-attributes"
  | "comark/broken-anchor"
  | "comark/invalid-frontmatter"
  | "comark/plugin-issue"
  | "comark/unsafe-url";

/** Every rule, with what it checks. */
export const rules: Record<Rule, string> = {
  "comark/unclosed-block": "Close every `::` block",
  "comark/unknown-component": "Use only known components",
  "comark/malformed-attributes": "Close `{` attributes and set each key once",
  "comark/broken-anchor": "Link `#fragments` to a heading or id in the document",
  "comark/invalid-frontmatter": "Write valid YAML frontmatter",
  "comark/plugin-issue": "Fix the problems Comark plugins report",
  "comark/unsafe-url": "Keep script URLs out of `href` and `src`",
};

export type Diagnostic = {
  rule: Rule;
  /** 1-based, counting the frontmatter. */
  line: number;
  /** 1-based, when the spot is known. Components inside a paragraph are found by searching its lines. */
  column?: number;
  /** What is wrong, naming the block. */
  message: string;
  /** How to fix it. */
  fix: string;
};

export type LintOptions = {
  /** The parse plugins the document is rendered with. Their `meta.issues` become `comark/plugin-issue`. */
  // oxlint-disable-next-line no-explicit-any -- each plugin types its own meta, as in Comark's ParserOptions.
  plugins?: readonly ComarkPlugin<any, any>[];
  /**
   * The components map you pass to the renderer, or a list of component names. HTML elements are
   * always known. Without it, `comark/unknown-component` is off, since any name could be valid.
   */
  components?: Record<string, unknown> | readonly string[];
};

type Token = {
  type: string;
  tag: string;
  nesting: number;
  map: [number, number] | null;
  children: Token[] | null;
};

type Block = { name: string; line: number; column: number };

/** Checks a Comark document and returns every problem, sorted by position. It never throws. */
export async function lint(markdown: string, options: LintOptions = {}): Promise<Diagnostic[]> {
  const source = read(markdown);
  const found: Diagnostic[] = [];
  const parsed = await parse(source, options.plugins ?? [], found);
  found.push(...unclosedBlocks(source), ...malformedAttributes(source));
  if (parsed) {
    const { document, tokens, offset } = parsed;
    const blocks = blockComponents(tokens, offset, source);
    if (options.components)
      found.push(...unknownComponents(tokens, offset, source, blocks, options.components));
    found.push(
      ...brokenAnchors(document.nodes, source),
      ...unsafeUrls(document.nodes, source),
      ...pluginIssues(document.meta, source, blocks),
    );
  }
  return found.sort((a, b) => a.line - b.line || (a.column ?? 0) - (b.column ?? 0));
}

async function parse(
  source: Source,
  plugins: NonNullable<LintOptions["plugins"]>,
  found: Diagnostic[],
): Promise<{ document: MarkdownDocument; tokens: Token[]; offset: number } | undefined> {
  const seen: { tokens: Token[]; offset: number } = { tokens: [], offset: 0 };
  const probe: ComarkPlugin = {
    name: "comark-lint",
    post(state) {
      // SAFETY: Comark parses with markdown-exit, whose tokens have this shape; it types them as unknown.
      seen.tokens = state.tokens as Token[];
      // Token lines start after the frontmatter, which Comark strips first.
      seen.offset = Number(state.parsedLines ?? 0);
    },
  };
  const run = async (markdown: string) => ({
    document: await parseMarkdown(markdown, { plugins: [...plugins, probe] }),
    ...seen,
  });
  try {
    return await run(source.lines.join("\n"));
  } catch (error) {
    if (!source.frontmatter || !(error instanceof Error) || error.name !== "YAMLException") {
      found.push(couldNotParse(error));
      return undefined;
    }
    // SAFETY: js-yaml's YAMLException carries the reason and the 0-based position in the frontmatter.
    const { reason, mark } = error as Error & {
      reason?: string;
      mark?: { line: number; column: number };
    };
    found.push({
      rule: "comark/invalid-frontmatter",
      line: source.frontmatter.start + 1 + (mark?.line ?? 0),
      column: mark ? mark.column + 1 : undefined,
      message: `The frontmatter is not valid YAML: ${reason ?? error.message}.`,
      fix: "Indent nested keys evenly, and quote any value that contains `: ` or starts with `*`, `&`, `!`, `[`, or `{`.",
    });
    try {
      // Blank lines in place of the frontmatter keep every line number, so the rest is still checked.
      return await run(
        source.lines.map((line, index) => (index < source.body ? "" : line)).join("\n"),
      );
    } catch (again) {
      found.push(couldNotParse(again));
      return undefined;
    }
  }
}

const couldNotParse = (error: unknown): Diagnostic => ({
  rule: "comark/plugin-issue",
  line: 1,
  message: `Comark could not parse this document: ${error instanceof Error ? error.message : String(error)}`,
  fix: "Fix what the error names; a plugin that throws stops the whole document from rendering.",
});

function unclosedBlocks(source: Source): Diagnostic[] {
  const open: (Block & { colons: string })[] = [];
  const unclosed: typeof open = [];
  for (const [index, line] of source.prose.entries()) {
    const opener = /^\s*(:{2,})([A-Za-z][\w-]*)/.exec(line);
    if (opener) {
      open.push({
        colons: opener[1]!,
        name: opener[2]!,
        line: index + 1,
        column: line.indexOf(":") + 1,
      });
      continue;
    }
    const colons = /^\s*(:{2,})\s*$/.exec(line)?.[1];
    if (!colons) continue;
    const match = open.findLastIndex((block) => block.colons === colons);
    // A closer also closes every block opened after its own, which then never got a closer.
    if (match !== -1) unclosed.push(...open.splice(match).slice(1));
  }
  return [...unclosed, ...open].map((block) => ({
    rule: "comark/unclosed-block",
    line: block.line,
    column: block.column,
    message: `\`${block.colons}${block.name}\` opened on line ${block.line} is never closed.`,
    fix: `Add a line with \`${block.colons}\` after its last child.`,
  }));
}

function malformedAttributes(source: Source): Diagnostic[] {
  const found: Diagnostic[] = [];
  // Attributes follow a component name, a `[span]`, or a link or image's `(url)`.
  const opener =
    /(?:^\s*(:{2,}[A-Za-z][\w-]*)|(?<![\w:])(:[A-Za-z][\w-]*)(?:\[[^\]]*\])?|[\])])\{/g;
  for (const [index, line] of source.prose.entries()) {
    for (const match of line.matchAll(opener)) {
      const name = match[1]?.trim() ?? match[2];
      const owner = name ? `\`${name}\`` : "The `{…}` attributes";
      const start = match.index + match[0].length - 1;
      const end = closingBrace(line, start);
      if (end === -1) {
        found.push({
          rule: "comark/malformed-attributes",
          line: index + 1,
          column: start + 1,
          message: `${owner} on line ${index + 1} ${name ? "opens its attributes with `{` and never closes them" : "open with `{` and never close"}.`,
          fix: "Add `}` after the last attribute. Comark reads the rest of the line as attributes.",
        });
        continue;
      }
      const seen = new Set<string>();
      const attributes = line.slice(start + 1, end);
      for (const attribute of attributes.matchAll(/[^\s"'=]+(?:=(?:"[^"]*"|'[^']*'|\S*))?/g)) {
        const raw = attribute[0];
        if (raw.startsWith(".")) continue;
        const key = raw.startsWith("#") ? "id" : raw.split("=")[0]!.replace(/^(?::|v-bind:)/, "");
        if (!seen.has(key)) {
          seen.add(key);
          continue;
        }
        found.push({
          rule: "comark/malformed-attributes",
          line: index + 1,
          column: start + 2 + attribute.index,
          message: `${owner} on line ${index + 1} ${name ? "sets" : "set"} \`${key}\` twice.`,
          fix: `Keep one \`${key}\`. Comark uses the last one and drops the others.`,
        });
      }
    }
  }
  return found;
}

function closingBrace(line: string, start: number): number {
  let quote = "";
  for (let at = start + 1; at < line.length; at++) {
    const char = line[at];
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "}") return at;
  }
  return -1;
}

function blockComponents(tokens: Token[], offset: number, source: Source): Block[] {
  return tokens.flatMap((token) => {
    if (token.type !== "mdc_block_open" || !token.map) return [];
    const line = token.map[0] + offset + 1;
    return [{ name: token.tag, line, column: (source.lines[line - 1]?.indexOf(":") ?? 0) + 1 }];
  });
}

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

function unknownComponents(
  tokens: Token[],
  offset: number,
  source: Source,
  blocks: Block[],
  components: NonNullable<LintOptions["components"]>,
): Diagnostic[] {
  const names = [
    ...new Set((Array.isArray(components) ? components : Object.keys(components)).map(kebab)),
  ].sort();
  const known = new Set([...names, ...htmlTags]);
  const used: { name: string; written: string; line: number; column?: number }[] = blocks.map(
    (block) => ({
      ...block,
      written: `${source.lines[block.line - 1]!.trim().match(/^:+/)![0]}${block.name}`,
    }),
  );
  for (const token of tokens) {
    if (token.type !== "inline" || !token.map) continue;
    const counts = new Map<string, number>();
    for (const child of token.children ?? []) {
      if (child.type !== "mdc_inline_component" || child.nesting === -1) continue;
      const nth = counts.get(child.tag) ?? 0;
      counts.set(child.tag, nth + 1);
      const at = find(source, `:${child.tag}`, {
        nth,
        from: token.map[0] + offset,
        to: token.map[1] + offset,
      });
      used.push({
        name: child.tag,
        written: `:${child.tag}`,
        line: at?.line ?? token.map[0] + offset + 1,
        column: at?.column,
      });
    }
  }
  return used.flatMap((component) => {
    if (known.has(kebab(component.name))) return [];
    const guess = closest(kebab(component.name), [...names, ...htmlTags]);
    const list = names.length ? `Known: ${names.map((name) => `\`${name}\``).join(", ")}.` : "";
    return [
      {
        rule: "comark/unknown-component" as const,
        line: component.line,
        column: component.column,
        message: `\`${component.written}\` on line ${component.line} is not a known component.`,
        fix: guess
          ? `Did you mean \`${guess}\`? ${list}`.trim()
          : `${list} If it is yours, add it to the components you give comark-lint.`.trim(),
      },
    ];
  });
}

function closest(word: string, candidates: readonly string[]): string | undefined {
  let best: string | undefined;
  let bestDistance = Math.max(1, Math.floor(word.length / 3)) + 1;
  for (const candidate of candidates) {
    const distance = levenshtein(word, candidate);
    if (distance < bestDistance) [best, bestDistance] = [candidate, distance];
  }
  return best;
}

function levenshtein(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        next[j - 1]! + 1,
        row[j]! + 1,
        row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[b.length]!;
}

// Comark text nodes are strings, elements are arrays, and comments are arrays with a null tag.
const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;

// Attribute values and meta entries arrive as strings, numbers, or booleans; anything else is no text.
const text = (value: unknown) =>
  value === undefined || value === null || value instanceof Object
    ? ""
    : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
      String(value as string | number | boolean);

function* elements(nodes: Node[]): Generator<ElementNode> {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    yield node;
    const [, , ...children] = node;
    yield* elements(children);
  }
}

// Repeated values are matched in order, so the second bad link is placed on the second one in the source.
function locator(source: Source) {
  const counts = new Map<string, number>();
  return (...needles: string[]) => {
    for (const needle of needles) {
      const nth = counts.get(needle) ?? 0;
      const at = find(source, needle, { nth, from: source.body });
      if (!at) continue;
      counts.set(needle, nth + 1);
      return at;
    }
    return { line: source.body + 1, column: undefined };
  };
}

const LISTED = 20;

function brokenAnchors(nodes: Node[], source: Source): Diagnostic[] {
  const ids = new Set<string>();
  const links: string[] = [];
  for (const [, attributes] of elements(nodes)) {
    const id = text(attributes.id);
    if (id) ids.add(id);
    const href = text(attributes.href);
    if (href.startsWith("#") && href.length > 1) links.push(href);
  }
  const locate = locator(source);
  const list = [...ids].map((id) => `\`#${id}\``);
  const available = list.length
    ? `Ids here: ${list.slice(0, LISTED).join(", ")}${list.length > LISTED ? `, and ${list.length - LISTED} more` : ""}.`
    : "This document has no headings or ids.";
  return links.flatMap((href) => {
    const fragment = decode(href.slice(1));
    if (ids.has(fragment) || ids.has(href.slice(1))) {
      locate(href, `#${fragment}`);
      return [];
    }
    const { line, column } = locate(href, `#${fragment}`);
    const guess = closest(fragment, [...ids]);
    return [
      {
        rule: "comark/broken-anchor",
        line,
        column,
        message: `The link to \`#${fragment}\` on line ${line} matches no heading or id in this document.`,
        fix: `${guess ? `Did you mean \`#${guess}\`? ` : ""}${available} To link somewhere else, add \`{#${fragment}}\` after the element it should point at.`,
      },
    ];
  });
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const ENTITIES = new Map([
  ["colon", ":"],
  ["tab", "\t"],
  ["newline", "\n"],
]);

// A local copy of the idea behind Comark's internal isUnsafeUrlValue: decode what a browser decodes, then read the scheme.
function unsafeScheme(value: string): string | undefined {
  let url = decode(value);
  for (let pass = 0; pass < 5; pass++) {
    const next = url
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16) % 0x110000),
      )
      .replace(/&#(\d+);?/g, (_, dec: string) =>
        String.fromCodePoint(Number.parseInt(dec, 10) % 0x110000),
      )
      .replace(
        /&([a-z]+);/gi,
        (entity, name: string) => ENTITIES.get(name.toLowerCase()) ?? entity,
      );
    if (next === url) break;
    url = next;
  }
  // Browsers skip whitespace and control characters inside a scheme, so `java\tscript:` still runs.
  url = url.replace(/[\s\p{Cc}]/gu, "").toLowerCase();
  const scheme = /^(javascript|vbscript|data):/.exec(url)?.[0];
  return scheme === "data:" && url.startsWith("data:image/") ? undefined : scheme;
}

function unsafeUrls(nodes: Node[], source: Source): Diagnostic[] {
  const locate = locator(source);
  const found: Diagnostic[] = [];
  for (const [tag, attributes] of elements(nodes)) {
    for (const key of ["href", "src"]) {
      const value = text(attributes[key]);
      if (!value) continue;
      const scheme = unsafeScheme(value);
      if (!scheme) continue;
      const { line, column } = locate(value);
      found.push({
        rule: "comark/unsafe-url",
        line,
        column,
        message: `The \`${key}\` of \`${tag}\` on line ${line} is a \`${scheme}\` URL.`,
        fix: "Use an https: or relative URL. A `javascript:`, `vbscript:`, or non-image `data:` URL can run script when it's clicked or loaded.",
      });
    }
  }
  return found;
}

function pluginIssues(
  meta: Record<string, unknown>,
  source: Source,
  blocks: Block[],
): Diagnostic[] {
  const issues = Array.isArray(meta.issues)
    ? meta.issues.flatMap((issue) => text(issue) || [])
    : [];
  const locate = locator(source);
  return issues.map((issue) => {
    const { line, column } = place(issue, blocks, locate);
    const sentences = issue.split(/(?<=[.!?])\s+(?=[A-Z`])/);
    return {
      rule: "comark/plugin-issue",
      line,
      column,
      message: sentences.length > 1 ? sentences.slice(0, -1).join(" ") : issue,
      fix: sentences.length > 1 ? sentences.at(-1)! : "Change the block as the message says.",
    };
  });
}

// Plugins name their block in prose, such as `compare 2` or `screenshot "before.png"`, so that is what gets searched for.
function place(
  issue: string,
  blocks: Block[],
  locate: ReturnType<typeof locator>,
): { line: number; column?: number } {
  const numbered = /^([a-z][\w-]*) (\d+)\b/.exec(issue);
  const block =
    numbered &&
    blocks.filter((candidate) => candidate.name === numbered[1])[Number(numbered[2]) - 1];
  if (block) return block;
  const quoted = /"((?:[^"\\]|\\.)+)"/.exec(issue)?.[1];
  if (quoted) {
    const at = locate(unescape(quoted));
    if (at.column) return at;
  }
  const named = /^([a-z][\w-]*)\b/.exec(issue)?.[1];
  return blocks.find((candidate) => candidate.name === named) ?? { line: 1 };
}

function unescape(quoted: string): string {
  try {
    return String(JSON.parse(`"${quoted}"`));
  } catch {
    return quoted;
  }
}

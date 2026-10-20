import type { Node } from "comark";
import { defineComarkPlugin } from "comark";

/** Reads a file by its POSIX path relative to `root`, such as `guide/setup.md`. Returns undefined when it doesn't exist. */
export type IncludeReader = (path: string) => string | undefined | Promise<string | undefined>;

export interface IncludeOptions {
  /** The folder includes can't leave, and where a `src` that starts with `/` starts. Default `"."`, the working directory. */
  root?: string;
  /** The host document's folder relative to `root`, where relative paths start. Default `""`, the root itself. */
  base?: string;
  /** Reads a file under `root`. Default reads from disk, so browsers and edge runtimes pass their own. */
  read?: IncludeReader;
  /** How many levels of includes may nest. Default 8. */
  depth?: number;
}

export type IncludeMeta = {
  /** Every file the document included or tried to include, relative to `root`, so a watcher can rebuild when one changes or appears. */
  includes: string[];
  /** One readable sentence per problem, naming its include and the fix. Other plugins add theirs too. */
  issues: string[];
};

interface Run {
  read: IncludeReader;
  depth: number;
  includes: Set<string>;
  issues: string[];
}

const LINE = /^([ \t]*):include\{(.*)\}\s*$/;
const ATTRIBUTE = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
const FENCE = /^[ \t]*(`{3,}|~{3,})(.*)$/;
const BLOCK_OPEN = /^[ \t]*(:{2,})([A-Za-z][\w-]*)/;
const BLOCK_CLOSE = /^[ \t]*(:{2,})\s*$/;
const REGION = /#(end)?region\b[ \t]*([\w$]+(?:[.-][\w$]+)*)?/;
const FRONTMATTER = /^---[ \t]*\n[\s\S]*?\n---[ \t]*(?:\n|$)/;
const OPTIONS = new Set(["src", "lines", "region", "code", "lang"]);
const MARKDOWN = new Set(["md", "mdc", "markdown"]);

// The design follows unjs/automd's `file` generator, so one argument list works in both.
function attributes(source: string) {
  const found = new Map<string, string>();
  // A bare flag such as `code` has an empty value.
  for (const [, key = "", double, single, bare] of source.matchAll(ATTRIBUTE))
    found.set(key, double ?? single ?? bare ?? "");
  return found;
}

// Paths are joined as strings, so the root check runs the same in Node, browsers, and edge runtimes.
function resolve(folder: string, src: string) {
  const parts = folder ? folder.split("/") : [];
  for (const part of src.split(/[/\\]/)) {
    if (part === "" || part === ".") continue;
    if (part !== "..") parts.push(part);
    else if (parts.pop() === undefined) return;
  }
  return parts.join("/");
}

const folderOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf("/")));
const extensionOf = (path: string) => {
  const name = path.slice(path.lastIndexOf("/") + 1);
  return name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
};
const isTrue = (value: string | undefined) => value !== undefined && value !== "false";
const indentOf = (line: string) => line.length - line.trimStart().length;
const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Marks each line that sits outside fenced code, where an include or a block marker means something. */
function outsideCode(lines: string[]) {
  let open = "";
  return lines.map((line) => {
    const [, marker = "", info = ""] = FENCE.exec(line) ?? [];
    if (open) {
      if (marker[0] === open[0] && marker.length >= open.length && !info.trim()) open = "";
      return false;
    }
    // A backtick fence's info string can't hold a backtick, so ```a``` is inline code.
    if (marker && !(marker[0] === "`" && info.includes("`"))) open = marker;
    return !open;
  });
}

/** The `::block` markers a text opens and doesn't close, innermost last. */
function openBlocks(lines: string[]) {
  const outside = outsideCode(lines);
  const stack: { colons: string; name: string }[] = [];
  for (const [index, line] of lines.entries()) {
    if (!outside[index]) continue;
    const close = BLOCK_CLOSE.exec(line);
    if (close) {
      const at = stack.findLastIndex((block) => block.colons === close[1]);
      if (at !== -1) stack.length = at;
      continue;
    }
    const [, colons, name] = BLOCK_OPEN.exec(line) ?? [];
    if (colons && name) stack.push({ colons, name });
  }
  return stack;
}

function dedent(lines: string[]) {
  const indent = lines
    .filter((line) => line.trim())
    .reduce((least, line) => Math.min(least, indentOf(line)), Infinity);
  return Number.isFinite(indent) ? lines.map((line) => line.slice(indent)) : lines;
}

/** The lines between `#region name` and `#endregion name`, without marker lines, or why there are none. */
function region(lines: string[], name: string) {
  const start = lines.findIndex((line) => {
    const match = REGION.exec(line);
    return match && !match[1] && match[2] === name;
  });
  if (start === -1) return "missing";
  const kept: string[] = [];
  let depth = 0;
  for (const line of lines.slice(start + 1)) {
    const match = REGION.exec(line);
    if (!match) kept.push(line);
    else if (!match[1]) depth++;
    else if (match[2] === name || (!match[2] && depth === 0)) return dedent(kept);
    else depth--;
  }
  return "unclosed";
}

const trimBlankLines = (text: string) => text.replace(/^(?:[ \t]*\n)+/, "").replace(/\s+$/, "");

async function include(source: string, folder: string, chain: string[], run: Run) {
  const fail = (issue: string) => void run.issues.push(issue);
  const args = attributes(source);
  const src = args.get("src")?.trim();
  if (!src) return fail('include: `src` is required, like :include{src="./part.md"}.');
  const name = `include "${src}"`;
  for (const key of args.keys())
    if (!OPTIONS.has(key))
      fail(`${name}: \`${key}\` isn't an include option; use src, lines, region, code, or lang.`);
  if (/^[a-z][a-z\d+.-]*:/i.test(src)) return fail(`${name}: only local files can be included.`);
  const path = resolve(src.startsWith("/") ? "" : folder, src);
  if (path === undefined)
    return fail(
      `${name}: the path leaves the root. Move the file under the root or widen \`root\`.`,
    );
  const lines = args.get("lines");
  const regionName = args.get("region");
  if (lines !== undefined && regionName !== undefined)
    return fail(`${name}: use \`lines\` or \`region\`, not both.`);
  if (chain.includes(path)) {
    const loop = [...chain.slice(chain.indexOf(path)), path].join(" -> ");
    return fail(`${name}: ${path} includes itself (${loop}). Remove one of the includes.`);
  }
  if (chain.length >= run.depth)
    return fail(
      `${name}: includes nest more than ${run.depth} deep (${[...chain, path].join(" -> ")}). Flatten them or raise \`depth\`.`,
    );

  run.includes.add(path);
  let text: string | undefined;
  try {
    text = await run.read(path);
  } catch (error) {
    return fail(
      `${name}: reading "${path}" failed: ${errorText(error)}. Check the file or the \`read\` option.`,
    );
  }
  if (text === undefined)
    return fail(
      `${name}: file not found. It resolved to "${path}" under the root; check the path or base.`,
    );

  let body = text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");
  if (lines !== undefined) {
    const [, from = "", to = ""] = /^(\d*):(\d*)$/.exec(lines) ?? [];
    const [start, end] = [Number(from || 1), Number(to || body.length)];
    if ((!from && !to) || start < 1 || end < start)
      return fail(
        `${name}: lines="${lines}" isn't a range; write lines="10:24", 1-based and inclusive.`,
      );
    if (end > body.length)
      return fail(
        `${name}: lines="${lines}" runs past the end of ${path}, which has ${body.length} lines. End the range at ${body.length} or earlier.`,
      );
    body = dedent(body.slice(start - 1, end));
  }
  if (regionName !== undefined) {
    const found = region(body, regionName);
    if (found === "missing")
      return fail(
        `${name}: region "${regionName}" isn't in ${path}. Mark it with #region ${regionName} and #endregion ${regionName} comments, or fix the name.`,
      );
    if (found === "unclosed")
      return fail(
        `${name}: region "${regionName}" in ${path} never ends. Add a #endregion ${regionName} comment after it.`,
      );
    body = found;
  }

  const lang = args.get("lang");
  if (isTrue(args.get("code")) || lang !== undefined || !MARKDOWN.has(extensionOf(path))) {
    const code = body.join("\n");
    const longest = (code.match(/`+/g) ?? []).reduce((most, run) => Math.max(most, run.length), 0);
    const ticks = "`".repeat(Math.max(3, longest + 1));
    const info = (lang ?? extensionOf(path)).replace(/[\s`]/g, "");
    return `${ticks}${info}\n${code}\n${ticks}`;
  }

  let markdown = body.join("\n");
  if (lines === undefined && regionName === undefined) markdown = markdown.replace(FRONTMATTER, "");
  const pasted = (await expand(markdown, folderOf(path), [...chain, path], run)).split("\n");
  // Comark closes open blocks before plugins run, so a block a partial leaves open would take in the rest of the host.
  const open = openBlocks(pasted);
  if (open.length) {
    fail(
      `${name}: ${path} leaves ${open.map((block) => `${block.colons}${block.name}`).join(", ")} open, so it was closed at the end of the include. Close it in the partial.`,
    );
    pasted.push(...open.reverse().map((block) => block.colons));
  }
  return trimBlankLines(pasted.join("\n"));
}

async function expand(markdown: string, folder: string, chain: string[], run: Run) {
  const lines = markdown.split("\n");
  const outside = outsideCode(lines);
  const out: string[] = [];
  for (const [index, line] of lines.entries()) {
    const match = outside[index] ? LINE.exec(line) : null;
    if (!match) {
      out.push(line);
      continue;
    }
    const [, indent = "", source = ""] = match;
    const pasted = await include(source, folder, chain, run);
    if (pasted) out.push(...pasted.split("\n").map((part) => part && indent + part));
  }
  return out.join("\n");
}

const isMissing = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  (error.code === "ENOENT" || error.code === "ENOTDIR");

function diskReader(root: string): IncludeReader {
  const folder = (root || ".").replace(/[/\\]+$/, "");
  return async (path) => {
    // Imported on first read, so the plugin loads in runtimes without node:fs when they pass their own `read`.
    const { readFile } = await import("node:fs/promises");
    try {
      return await readFile(`${folder}/${path}`, "utf8");
    } catch (error) {
      if (isMissing(error)) return undefined;
      throw error;
    }
  };
}

/** Removes the includes the text splice couldn't expand, keeping whatever a `::include` took in. */
function strays(list: Node[], start: number, issues: string[]) {
  const inline = list.slice(start).some((node) => !Array.isArray(node));
  for (let index = start; index < list.length; index++) {
    const node = list[index];
    if (!Array.isArray(node) || node[0] === null) continue;
    const [tag, attrs, ...children] = node;
    if (tag !== "include") {
      // SAFETY: an element node is [tag, attributes, ...children], so its items from index 2 are nodes.
      strays(node as Node[], 2, issues);
      continue;
    }
    const src =
      attrs.src === undefined || attrs.src === null || attrs.src instanceof Object
        ? ""
        : // SAFETY: undefined, null, objects, and arrays returned above, so only a string, number, or boolean is left.
          String(attrs.src as string | number | boolean);
    const name = src ? `include "${src}"` : "include";
    issues.push(
      children.length || !inline
        ? `${name}: \`::include\` takes in the rest of the document. Write it with one colon, :include{src="${src}"}, alone on its own line.`
        : `${name} isn't on its own line, so it was dropped. Put it on a line of its own with nothing else.`,
    );
    list.splice(index, 1, ...children);
    index--;
  }
}

/**
 * Pastes Markdown partials and code snippets from files into the document before it's parsed, so headings, ids, and
 * every other plugin see one document. Each `:include{src="..."}` sits alone on its own line. Problems are added to
 * `meta.issues` and the files read to `meta.includes`.
 */
export default defineComarkPlugin<IncludeOptions, IncludeMeta>((options = {}) => {
  // pre and post get the same state object, so one parse's findings never mix with another's.
  const runs = new WeakMap<object, Run>();
  const fresh = (): Run => ({
    read: options.read ?? diskReader(options.root ?? "."),
    depth: options.depth ?? 8,
    includes: new Set(),
    issues: [],
  });
  return {
    name: "comark-include",
    async pre(state) {
      const run = fresh();
      runs.set(state, run);
      const base = resolve("", options.base ?? "");
      if (base === undefined)
        run.issues.push(
          `include: \`base\` "${options.base ?? ""}" leaves the root. Set it to the document's folder under \`root\`.`,
        );
      state.markdown = await expand(state.markdown, base ?? "", [], run);
    },
    post(state) {
      const run = runs.get(state) ?? fresh();
      const { tree } = state;
      strays(tree.nodes, 0, run.issues);
      tree.meta.includes = [...run.includes];
      tree.meta.issues = [...(tree.meta.issues ?? []), ...run.issues];
    },
  };
});

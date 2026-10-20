/** A Markdown source split into lines, with fenced code and frontmatter blanked out, so scans and searches only see what Comark parses. */
export type Source = {
  lines: string[];
  /** Each line with code, frontmatter, and inline code spans replaced by spaces. Columns still match `lines`. */
  prose: string[];
  /** The 0-based index of the first line after the frontmatter. */
  body: number;
  /** The frontmatter between the `---` lines, when there is one. */
  frontmatter?: { start: number; end: number };
};

export function read(markdown: string): Source {
  const lines = markdown.split(/\r?\n/);
  const prose = [...lines];
  let body = 0;
  let frontmatter: Source["frontmatter"];
  // Comark's own rule: `---` on the first line, closed by the next line that starts with `---`.
  if (lines[0]?.startsWith("---")) {
    const end = lines.findIndex((line, index) => index > 0 && line.startsWith("---"));
    if (end > 1) {
      frontmatter = { start: 1, end };
      body = end + 1;
      for (let index = 0; index <= end; index++) prose[index] = "";
    }
  }
  let fence: { char: string; size: number } | undefined;
  for (let index = body; index < lines.length; index++) {
    const line = lines[index]!;
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (
        marker?.[0] === fence.char &&
        marker.length >= fence.size &&
        !line.trim().slice(marker.length)
      )
        fence = undefined;
      prose[index] = "";
    } else if (marker) {
      fence = { char: marker[0]!, size: marker.length };
      prose[index] = "";
    } else prose[index] = line.replace(/(`+)[^`]*?\1/g, (span) => " ".repeat(span.length));
  }
  return { lines, prose, body, frontmatter };
}

/** Where `needle` appears in prose, 1-based, from the `nth` match on. A match must not run on into a longer name. */
export function find(
  source: Source,
  needle: string,
  {
    nth = 0,
    from = 0,
    to = source.prose.length,
  }: { nth?: number; from?: number; to?: number } = {},
): { line: number; column: number } | undefined {
  let seen = 0;
  for (let index = from; index < Math.min(to, source.prose.length); index++) {
    const line = source.prose[index]!;
    for (let at = line.indexOf(needle); at !== -1; at = line.indexOf(needle, at + 1)) {
      if (/[\w-]/.test(line[at + needle.length] ?? "") && /[\w-]$/.test(needle)) continue;
      if (seen++ === nth) return { line: index + 1, column: at + 1 };
    }
  }
  return undefined;
}

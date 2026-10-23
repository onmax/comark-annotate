---
title: Syntax
description: Partials and snippets by lines or region, and the plugin's options.
---

Each include sits alone on its own line, with one colon:

```md
:include{src="./parts/pizza-policy.md"}

:include{src="/src/ducks.ts" lines="10:24"}

:include{src="/src/ducks.ts" region="estimate"}
```

| Argument | |
| --- | --- |
| `src` | The file. A relative path starts at the page's folder, or at the including partial's; `/` starts at `root`. Required. |
| `lines` | `"10:24"`: lines 10 to 24, 1-based and inclusive. `"10:"` and `":24"` leave one end open. Lines count from the top of the file, frontmatter included. |
| `region` | The lines between `#region estimate` and `#endregion estimate`. A marker starts its line, after a comment opener if any: `//`, `#`, `/*`, `<!--`, `--`, `;`, `%`, or `'`. Marker lines are dropped. |
| `code` | Shows a Markdown file as code instead of pasting it. |
| `lang` | The code block's language, instead of the extension. |

A `.md`, `.mdc`, or `.markdown` file is pasted without its frontmatter, and its own includes resolve from its folder. Code gets a fence longer than any backtick run in the file, and `lines` and `region` are dedented. An include inside fenced code stays as it is, which is how this page shows the syntax.

Pasted lines are indented like the include, so a partial can sit in a list item:

```md
1. Count the pigeons on the roof.

   :include{src="./parts/pigeon-count.md"}
2. Postpone the deploy.
```

## Options

| Option | |
| --- | --- |
| `root` | The folder includes can't leave. Default `"."`, the working directory. |
| `base` | The page's folder relative to `root`. Default `""`, the root. |
| `read(path)` | Reads a file by its POSIX path relative to `root`, and returns its text or `undefined`. It may be async. Default: reads from disk. |
| `depth` | How many levels of includes may nest. Default `8`. |

Comark doesn't tell plugins where a page lives, so set `base` to its folder.

The plugin joins paths as strings, so `../` can't leave `root` in any runtime, and `read` only gets paths under it. The default reader also refuses a symlink that leads out of `root`. If your own `read` can meet symlinks, it has to refuse them itself.

In a browser or an edge runtime, pass your own `read`:

```ts
const files = import.meta.glob("./content/**/*.md", { query: "?raw", import: "default" });

include({ read: async (path) => files[`./content/${path}`]?.() });
```

`meta.includes` lists every file a page included or tried to include, so a watcher can rebuild it when one changes or appears.

---
title: comark-include
description: Markdown partials and code snippets from files, written in Markdown.
tagline: Paste a shared section, or a few lines of real source, into any page with one line, and keep a single copy of each.
install: pnpm add comark comark-include
---

::examples
:::example{label="Partial"}
```md
:include{src="./partials/install.md"}
```
:::

:::example{label="Region"}
```md
:include{src="./partials/greet.ts" region="message"}
```
:::

:::example{label="Lines"}
```md
:include{src="./partials/greet.ts" lines="1:3"}
```
:::

:::example{label="Source"}
```md
:include{src="./partials/install.md" code}
```
:::
::

These examples include real files from this site's source. A Markdown file is pasted into the page, and any other file becomes a code block in the language of its extension.

## Usage

Register the plugin. It has no components, because the included text renders as the rest of the page does:

```ts
import { parseMarkdown } from "comark";
import include from "comark-include";

const document = await parseMarkdown(markdown, {
  plugins: [include({ root: "content", base: "guide" })],
});
```

## Syntax

Each include sits alone on its own line, with one colon:

```md
:include{src="./parts/setup.md"}

:include{src="/src/index.ts" lines="10:24"}

:include{src="/src/index.ts" region="setup"}
```

| Argument | |
| --- | --- |
| `src` | The file. A relative path starts at the page's folder, or at the including partial's; `/` starts at `root`. Required. |
| `lines` | `"10:24"`: lines 10 to 24, 1-based and inclusive. `"10:"` and `":24"` leave one end open. Lines count from the top of the file, frontmatter included. |
| `region` | The lines between `#region setup` and `#endregion setup`. A marker starts its line, after a comment opener if any: `//`, `#`, `/*`, `<!--`, `--`, `;`, `%`, or `'`. Marker lines are dropped. |
| `code` | Shows a Markdown file as code instead of pasting it. |
| `lang` | The code block's language, instead of the extension. |

A `.md`, `.mdc`, or `.markdown` file is pasted without its frontmatter, and its own includes resolve from its folder. Code gets a fence longer than any backtick run in the file, and `lines` and `region` are dedented. An include inside fenced code stays as it is, which is how this page shows the syntax.

Pasted lines are indented like the include, so a partial can sit in a list item:

```md
1. Install the packages.

   :include{src="./parts/install.md"}
2. Register the plugin.
```

## Options

| Option | |
| --- | --- |
| `root` | The folder includes can't leave. Default `"."`, the working directory. |
| `base` | The page's folder relative to `root`. Default `""`, the root. |
| `read(path)` | Reads a file by its POSIX path relative to `root`, and returns its text or `undefined`. It may be async. Default: reads from disk. |
| `depth` | How many levels of includes may nest. Default `8`. |

Comark doesn't tell plugins where a page lives, so set `base` to its folder. Paths are joined as strings, so `../` can't leave `root` in any runtime, and `read` only gets paths under it. The default reader also refuses a symlink that leads out of `root`; your own `read` has to do that itself if its files can hold symlinks. In a browser or an edge runtime, pass your own `read`:

```ts
const files = import.meta.glob("./content/**/*.md", { query: "?raw", import: "default" });

include({ read: async (path) => files[`./content/${path}`]?.() });
```

`meta.includes` lists every file a page included or tried to include, so a watcher can rebuild it when one changes or appears.

## Guides

### Validation

An include that fails is dropped, and the plugin adds a sentence to `meta.issues` that names it and says how to fix it:

```txt
include "./x.md": file not found. It resolved to "guide/x.md" under the root; check the path or base.
include "../../etc/passwd": the path leaves the root. Move the file under the root or widen `root`.
include "./a.md": guide/a.md includes itself (guide/a.md -> guide/b.md -> guide/a.md). Remove one of the includes.
```

It reports a missing `src`, an argument it doesn't know, a missing file, a path that leaves the root, a URL, a cycle, nesting past `depth`, a `lines` range that is malformed or runs past the end, a missing or unclosed `region`, `lines` with `region`, a reader that throws, and an include that isn't alone on its line or is written `::include`. A partial that leaves a `::block` open is closed at the end of its paste and reported. Rendering never throws.

### One parse

The plugin pastes the files into the Markdown before Comark reads it, so a page parses once: heading ids stay unique across partials, and every other plugin runs once over the whole page. Comark closes open blocks before plugins run, which is why an include is `:include` with one colon: a `::include` line would take in the rest of the page.

Streaming parses aren't supported.

### GitHub and npm

GitHub and npm show a README's source, and no Comark renderer runs there. For those files, use [automd](https://github.com/unjs/automd)'s `file` generator, which writes the included text into the file itself. Its arguments share these names: `src`, `lines="a:b"`, `code`, and `lang`.

## Credits

[Comark](https://comark.dev), by the [Comark team](https://github.com/comarkdown), parses the Markdown and renders it. The arguments follow [automd](https://github.com/unjs/automd).

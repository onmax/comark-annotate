---
title: Guides
description: Validation, parsing once, and includes on GitHub and npm.
---

## Validation

The plugin drops an include that fails. It adds a sentence to `meta.issues` that names the include and says how to fix it, as [Validation](/guide/validation/) describes:

```txt
include "./duck-log.md": file not found. It resolved to "guide/duck-log.md" under the root; check the path or base.
include "../../etc/passwd": the path leaves the root. Move the file under the root or widen `root`.
include "./pizzas.md": guide/pizzas.md includes itself (guide/pizzas.md -> guide/merged-prs.md -> guide/pizzas.md). Remove one of the includes.
```

It reports:

- A missing `src`, or an argument it doesn't know.
- A missing file, a path that leaves the root, or a URL.
- A cycle, or nesting past `depth`.
- A `lines` range that is malformed or runs past the end.
- A missing or unclosed `region`, or `lines` with `region`.
- A reader that throws.
- An include that isn't alone on its line, or is written `::include`.

A partial that leaves a `::block` open is closed at the end of its paste, and reported. Each one has its own rule in [Doctor](/doctor/).

## One parse

The plugin pastes the files into the Markdown before Comark reads it, so a page parses once. Heading ids stay unique across partials, and every other plugin runs once over the whole page.

Comark closes open blocks before plugins run. That's why an include is `:include` with one colon, since a `::include` line would take in the rest of the page.

Streaming parses aren't supported.

## GitHub and npm

GitHub and npm show a README's source, and no Comark renderer runs there. For those files, use [automd](https://github.com/unjs/automd)'s `file` generator, which writes the included text into the file itself. Its arguments share these names: `src`, `lines="a:b"`, `code`, and `lang`.

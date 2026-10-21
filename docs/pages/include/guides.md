---
title: Guides
description: Validation, parsing once, and includes on GitHub and npm.
---

## Validation

An include that fails is dropped, and the plugin adds a sentence to `meta.issues` that names it and says how to fix it, as [Validation](/guide/validation/) describes:

```txt
include "./x.md": file not found. It resolved to "guide/x.md" under the root; check the path or base.
include "../../etc/passwd": the path leaves the root. Move the file under the root or widen `root`.
include "./a.md": guide/a.md includes itself (guide/a.md -> guide/b.md -> guide/a.md). Remove one of the includes.
```

It reports a missing `src`, an argument it doesn't know, a missing file, a path that leaves the root, a URL, a cycle, nesting past `depth`, a `lines` range that is malformed or runs past the end, a missing or unclosed `region`, `lines` with `region`, a reader that throws, and an include that isn't alone on its line or is written `::include`. A partial that leaves a `::block` open is closed at the end of its paste and reported.

## One parse

The plugin pastes the files into the Markdown before Comark reads it, so a page parses once: heading ids stay unique across partials, and every other plugin runs once over the whole page. Comark closes open blocks before plugins run, which is why an include is `:include` with one colon: a `::include` line would take in the rest of the page.

Streaming parses aren't supported.

## GitHub and npm

GitHub and npm show a README's source, and no Comark renderer runs there. For those files, use [automd](https://github.com/unjs/automd)'s `file` generator, which writes the included text into the file itself. Its arguments share these names: `src`, `lines="a:b"`, `code`, and `lang`.

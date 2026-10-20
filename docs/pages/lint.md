---
title: comark-lint
description: Finds unclosed blocks, unknown components, broken anchors, and plugin issues in Comark documents.
tagline: Check Comark documents before they publish, from a script, the command line, or Vite Doctor. Every message names the block and says how to fix it.
install: pnpm add -D comark-lint
---

Comark forgives a lot: it closes a `::` block you forgot to close, reads a missing `}` as the end of the line, and renders a misspelled component as an empty element. comark-lint reports each of these, with its line, so whoever wrote the document, often an agent, can fix it.

```txt
docs/review.md:8:1 comark/unclosed-block `::compare` opened on line 8 is never closed. Add a line with `::` after its last child.
docs/review.md:12:1 comark/unknown-component `::screnshot` on line 12 is not a known component. Did you mean `screenshot`? Known: `annotation`, `compare`, `screenshot`.
```

## Usage

### Command line

```sh
pnpm comark-lint "docs/**/*.md"
pnpm comark-lint review.md --format json
```

It checks each file with the plugins and components of every comark-plugins package installed: annotate, carousel, github-callouts, and zoom. It prints one `file:line:column rule message` line per problem and exits with 1 if there are any, or 2 if a file can't be read.

Components of your own go in a config, passed with `--config`:

```ts
// comark-lint.config.ts
import { defineConfig } from "comark-lint";
import mermaid from "./mermaid.ts";

export default defineConfig({
  plugins: [mermaid()],
  components: ["tabs", "example"],
});
```

Its `plugins` and `components` are added to the installed packages'. `components` takes a list of names or the components map you give the renderer. Node loads a `.ts` config from 22.18 on; on older versions, write it as `.mjs`.

### Library

```ts
import { lint } from "comark-lint";
import annotate, { components } from "comark-annotate/html";

const diagnostics = await lint(markdown, { plugins: [annotate()], components });
// [{ rule: "comark/unclosed-block", line: 8, column: 1, message: "…", fix: "…" }]
```

`lint()` never throws; if a rule crashes on a document, that rule reports one diagnostic saying so and the others still run. Pass the same plugins and components you render with. Without `components`, `comark/unknown-component` is off, since any name could be valid; HTML elements are always known. `resolveConfig()` returns the installed packages' plugins and components, as the command line uses them.

### Vite Doctor

`comark-lint/doctor` is a [Vite Doctor](https://github.com/onmax/vite-doctor) extension. Vite Doctor loads extensions from an executable config, so register it in `doctor.config.ts`:

```ts
// doctor.config.ts
import comark from "comark-lint/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

export default defineDoctorConfig({
  extends: ["auto"],
  extensions: [comark({ components: ["tabs"] })],
});
```

```sh
pnpm vite-doctor . --config doctor.config.ts
```

It lints `**/*.{md,mdc}` except `node_modules` and `dist`; set `include` and `exclude` to change that. Each rule reports with its own code, `COMARK0001` to `COMARK0007`, and the `comark/recommended` preset turns them all on. It runs whenever the extension is registered. It needs `vite-doctor` 0.1 or later.

## Rules

### `comark/unclosed-block` {#comark0001}

A `::` block needs a closing line with the same number of colons. Comark closes it at the end of the document, or at the next closer of an outer block, so everything after it moves inside. Code and HTML blocks are skipped, since Comark reads them as text.

### `comark/unknown-component` {#comark0002}

A block or inline component that isn't in your components or HTML, with the closest known name when one is near. Comark renders an unknown component as an empty element.

### `comark/malformed-attributes` {#comark0003}

A `{` that opens attributes and is never closed, after a component, a `[span]`, a link, or an image. Comark reads the rest of the line as attributes. Also a key set twice in one `{…}`; Comark keeps only the last.

### `comark/broken-anchor` {#comark0004}

A `#fragment` link that matches no heading id or `{#id}` in the same document. The message lists the ids it has. Links to other documents and external links aren't checked.

### `comark/invalid-frontmatter` {#comark0005}

Frontmatter that isn't valid YAML, on the line of the YAML error. Comark throws on it; comark-lint reports it and still checks the rest of the document.

### `comark/plugin-issue` {#comark0006}

Every problem a plugin adds to `meta.issues`, such as a screenshot without `alt` from comark-annotate. It's placed on the block the message names when the source shows where that is, and on line 1 otherwise.

### `comark/unsafe-url` {#comark0007}

A `javascript:`, `vbscript:`, or `data:` URL in an `href` or `src`. `data:` images are fine.

## Positions

Comark gives parsed nodes no source positions. comark-lint takes block components' lines from the parser's tokens and finds everything else by searching the source, so a component inside a paragraph gets its line and the first matching column, a URL is matched where it starts an attribute or link rather than in prose, and a repeated value is matched in order.

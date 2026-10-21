---
title: Getting started
description: Run lint-comark from the command line, a script, or Vite Doctor.
install: pnpm add -D lint-comark
---

## Command line

```sh
pnpm lint-comark "docs/**/*.md"
pnpm lint-comark ducks-vs-bugs.md --format json
```

It checks each file with the plugins and components of every comark-plugins package installed: annotate, carousel, github-callouts, and zoom. It prints one `file:line:column rule message` line per problem and exits with 1 if there are any, or 2 if a file can't be read.

Components of your own go in a config, passed with `--config`:

```ts
// lint-comark.config.ts
import { defineConfig } from "lint-comark";
import mermaid from "./mermaid.ts";

export default defineConfig({
  plugins: [mermaid()],
  components: ["duck-count", "pigeon-map"],
});
```

Its `plugins` and `components` are added to the installed packages'. `components` takes a list of names or the components map you give the renderer. Node loads a `.ts` config from 22.18 on; on older versions, write it as `.mjs`.

## Library

```ts
import { lint } from "lint-comark";
import annotate, { components } from "comark-annotate/html";

const diagnostics = await lint(markdown, { plugins: [annotate()], components });
// [{ rule: "comark/unclosed-block", line: 8, column: 1, message: "…", fix: "…" }]
```

`lint()` never throws; if a rule crashes on a document, that rule reports one diagnostic saying so and the others still run. Pass the same plugins and components you render with. Without `components`, `comark/unknown-component` is off, since any name could be valid; HTML elements are always known. `resolveConfig()` returns the installed packages' plugins and components, as the command line uses them.

## Vite Doctor

`lint-comark/doctor` runs the same rules inside [Vite Doctor](/lint/vite-doctor/), each with its own code.

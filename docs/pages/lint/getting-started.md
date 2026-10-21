---
title: Getting started
description: Run comark-linter from the command line, a script, or Vite Doctor.
install: pnpm add -D comark-linter
---

## Command line

```sh
pnpm lint-comark "docs/**/*.md"
pnpm lint-comark review.md --format json
```

The package is `comark-linter`, since npm refuses `comark-lint` as too close to `remark-lint`. Its command and config file are `comark-lint`.

It checks each file with the plugins and components of every comark-plugins package installed: annotate, carousel, github-callouts, and zoom. It prints one `file:line:column rule message` line per problem and exits with 1 if there are any, or 2 if a file can't be read.

Components of your own go in a config, passed with `--config`:

```ts
// comark-lint.config.ts
import { defineConfig } from "comark-linter";
import mermaid from "./mermaid.ts";

export default defineConfig({
  plugins: [mermaid()],
  components: ["tabs", "example"],
});
```

Its `plugins` and `components` are added to the installed packages'. `components` takes a list of names or the components map you give the renderer. Node loads a `.ts` config from 22.18 on; on older versions, write it as `.mjs`.

## Library

```ts
import { lint } from "comark-linter";
import annotate, { components } from "comark-annotate/html";

const diagnostics = await lint(markdown, { plugins: [annotate()], components });
// [{ rule: "comark/unclosed-block", line: 8, column: 1, message: "…", fix: "…" }]
```

`lint()` never throws; if a rule crashes on a document, that rule reports one diagnostic saying so and the others still run. Pass the same plugins and components you render with. Without `components`, `comark/unknown-component` is off, since any name could be valid; HTML elements are always known. `resolveConfig()` returns the installed packages' plugins and components, as the command line uses them.

## Vite Doctor

`comark-linter/doctor` is a [Vite Doctor](https://github.com/onmax/vite-doctor) extension. Vite Doctor loads extensions from an executable config, so register it in `doctor.config.ts`:

```ts
// doctor.config.ts
import comark from "comark-linter/doctor";
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

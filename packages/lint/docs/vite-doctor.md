---
title: Vite Doctor
description: Lint a project's Markdown as part of Vite Doctor, with one code per rule.
install: pnpm add -D comark-linter vite-doctor
---

## Setup

`comark-linter/doctor` is a [Vite Doctor](https://github.com/onmax/vite-doctor) extension. Vite Doctor loads extensions from an executable config, so register it in `doctor.config.ts`:

```ts
// doctor.config.ts
import comark from "comark-linter/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [comark({ components: ["duck-count"] })],
});
```

```sh
pnpm vite-doctor . --config doctor.config.ts
```

It runs whenever the extension is registered, and the `comark/recommended` preset turns every rule on. It needs `vite-doctor` 0.1 or later.

## Options

It takes the same options as the [command line's config](/lint/getting-started/#command-line), plus two of its own:

| Option | |
| --- | --- |
| `include` | The Markdown to check, relative to the project root. Default `**/*.{md,mdc}`. |
| `exclude` | Globs to skip. Default `**/node_modules/**` and `**/dist/**`. |

Links resolve from the project root, and files are read through Vite Doctor's read-only `ctx.fs`, so its cache knows which files a result depends on. `comark/dead-url` is marked `env-dependent`, since its result depends on the network; the URL cache is still written to `node_modules/.cache/comark-linter/` with node:fs, because `ctx.fs` can't write.

This site lints its own pages this way. Its `docs/build.ts` renders a few components itself, so the config names them, and its routes mirror the pages' URLs:

```ts
// doctor.config.ts
export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [
    comark({
      include: "{docs/pages,packages/*/docs}/**/*.md",
      components: ["demo", "drop", "example", "examples", "hero", "matrix", "packages"],
      links: {
        // A package's pages come from its docs/, the rest from docs/pages, and files from docs/public.
        routes(path) {
          const [first = "", ...rest] = path.split("/").filter(Boolean);
          if (first === "play") return true;
          if (existsSync(`packages/${first}/docs/index.md`))
            return `packages/${first}/docs/${rest.join("/")}`;
          return /\.\w+$/.test(path) ? `docs/public${path}` : `docs/pages${path}`;
        },
      },
    }),
  ],
});
```

## Codes

Each rule reports with its own code, and the code links to the rule's entry on the [overview](/lint/#rules). Frontmatter Comark can't read and unsafe URLs are errors; the rest are warnings.

| Code | Rule | Severity |
| --- | --- | --- |
| [`COMARK0001`](/lint/#comark0001) | `comark/unclosed-block` | warning |
| [`COMARK0002`](/lint/#comark0002) | `comark/unknown-component` | warning |
| [`COMARK0003`](/lint/#comark0003) | `comark/malformed-attributes` | warning |
| [`COMARK0004`](/lint/#comark0004) | `comark/broken-anchor` | warning |
| [`COMARK0005`](/lint/#comark0005) | `comark/invalid-frontmatter` | error |
| [`COMARK0006`](/lint/#comark0006) | `comark/plugin-issue` | warning |
| [`COMARK0007`](/lint/#comark0007) | `comark/unsafe-url` | error |
| [`COMARK0008`](/lint/#comark0008) | `comark/broken-link` | warning |
| [`COMARK0009`](/lint/#comark0009) | `comark/blocked-url` | warning |
| [`COMARK0010`](/lint/#comark0010) | `comark/dead-url` | warning |

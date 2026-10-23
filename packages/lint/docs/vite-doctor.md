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

It takes the same `plugins` and `components` as the [command line's config](/lint/getting-started/#command-line), plus two of its own:

| Option | |
| --- | --- |
| `include` | The Markdown to check, relative to the project root. Default `**/*.{md,mdc}`. |
| `exclude` | Globs to skip. Default `**/node_modules/**` and `**/dist/**`. |

This site lints its own pages this way. Its `docs/build.ts` renders a few components itself, so the config names them:

```ts
// doctor.config.ts
export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [
    comark({
      include: "docs/pages/**/*.md",
      components: ["cards", "example", "examples", "hero", "matrix"],
    }),
  ],
});
```

## Codes

Each rule reports with its own code, and the code links to the rule's page in [Doctor](/doctor/). The core rules are `COMARK0001` on, and each package's rules take a hundred of their own: comark-annotate's are `COMARK0101` on, comark-cards' `COMARK0201` on, and so on. Frontmatter Comark can't read and unsafe URLs are errors; the rest are warnings. [Doctor's overview](/doctor/#rules) lists every code.

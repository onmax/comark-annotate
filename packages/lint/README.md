# comark-lint

Finds unclosed blocks, unknown components, broken anchors, and plugin issues in [Comark](https://comark.dev) documents. A library, a CLI, and a [Vite Doctor](https://github.com/onmax/vite-doctor) extension. Every message names the block and says how to fix it.

**[Docs](https://comark.onmax.me/lint/)**

```sh
pnpm add -D comark-lint
pnpm comark-lint "docs/**/*.md"
```

```txt
docs/review.md:8:1 comark/unclosed-block `::compare` opened on line 8 is never closed. Add a line with `::` after its last child.
```

The CLI checks each file with every comark-plugins package installed (annotate, carousel, github-callouts, zoom), prints `file:line:column rule message`, or JSON with `--format json`, and exits with 1 on any problem. Add your own plugins and component names with `--config comark-lint.config.ts`, which exports `defineConfig({ plugins, components })`.

```ts
import { lint } from "comark-lint";
import annotate, { components } from "comark-annotate/html";

const diagnostics = await lint(markdown, { plugins: [annotate()], components });
```

`lint()` never throws and returns `{ rule, line, column?, message, fix }[]`. Without `components`, unknown components aren't reported.

For Vite Doctor 0.1 or later, register the extension in `doctor.config.ts` and run `vite-doctor . --config doctor.config.ts`:

```ts
import comark from "comark-lint/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

export default defineDoctorConfig({ extends: ["auto"], extensions: [comark()] });
```

| Rule | Code | Reports |
| --- | --- | --- |
| `comark/unclosed-block` | `COMARK0001` | A `::` block that is never closed |
| `comark/unknown-component` | `COMARK0002` | A component that isn't in your components or HTML |
| `comark/malformed-attributes` | `COMARK0003` | An unclosed `{`, or a key set twice |
| `comark/broken-anchor` | `COMARK0004` | A `#fragment` that matches no heading or id |
| `comark/invalid-frontmatter` | `COMARK0005` | Frontmatter that isn't valid YAML |
| `comark/plugin-issue` | `COMARK0006` | Each problem a plugin adds to `meta.issues` |
| `comark/unsafe-url` | `COMARK0007` | A `javascript:`, `vbscript:`, or non-image `data:` URL |

Comark gives parsed nodes no positions, so block components take their line from the parser's tokens and everything else is found by searching the source.

# comark-plugins

Comark plugins for review documents: annotated screenshots and before/after comparisons. Agents write most of the documents they render, often as PR evidence. Because of that, the issue messages are as important as the HTML: every one names its block and says how to fix it.

## Shape

A pnpm workspace. Every package in `packages/` is published to npm under its own name, and all of them share one version.

- `packages/annotate` is `comark-annotate`.
  - `src/read.ts` reads `::screenshot`, `::compare`, and `::annotation` nodes and reports their issues. The plugin and the renderer both go through it, so they can't disagree.
  - `src/index.ts` is the parse plugin. It appends its problems to `meta.issues`.
  - `src/html.ts` is the `@comark/html` renderer. The output reads without a script; the zoom and carousel scripts and all styles are inlined once per document. A screenshot zooms with `comark-zoom`, and `::compare` is a two-column `comark-carousel`. Marks are not links, so a click anywhere on a screenshot zooms it.
  - Only the HTML renderer exists: notes are Markdown, and Vue, React, and Svelte versions would each copy the whole figure template.
  - `src/marks.ts` holds the hand-drawn marks, taken from AnnotationKit.
- `packages/carousel` is `comark-carousel`. Its parse plugin turns `::carousel` content into explicit `slide` nodes with their position, so no renderer splits children. Its script is built like zoom's, and a carousel is a zoom gallery.
- `packages/embed` is `comark-embed`. Its parse plugin reads the player's `src` from the `::embed` link alone, with no fetch, and replaces the node's attributes with `provider`, `src`, `label`, `size`, `href`, `title`, and `host`, so no renderer parses URLs. `src/providers.ts` holds one entry per provider. A link with no player becomes a card, and one that isn't https renders nothing. No script: the components add the styles on mount.
- `packages/github-callouts` is `comark-github-callouts`. Its parse plugin is named `alert`, so Comark's dedupe swaps it in for the built-in alert plugin and it always sees the raw `[!TYPE]` marker. It turns those blockquotes into `github-callout` nodes with `type` and `title`; the renderers only draw them. No script: the components add the styles on mount.
- `packages/zoom` is `comark-zoom`.
  - `src/index.ts` is the parse plugin. It marks content images and adds one `zoom-runtime` node to a document with anything to zoom.
  - `src/script.ts` is the browser script. `script()` is self-contained because the HTML renderer inlines its source. `src/client.ts` exports `start()`, which runs it with the bundled styles; Vue, React, and Svelte components call it on mount and stop it on unmount.
  - `src/theme.ts` resolves the shared `--comark-*` tokens, and `comark-zoom/theme` exports it alone. `comark-github-callouts` and `comark-embed` have it as a dev dependency and bundle only this entry, so they don't install zoom or carry its styles.
  - `src/html.ts`, `src/vue.ts`, `src/react.ts`, and `src/svelte/` are the renderers. They all output the same markup.
- `docs/` builds the docs site with the plugins themselves. Cloudflare serves it from `docs/dist`.

## Rules

- Follow the 90/10 rule. If a feature would take most of the code for a small share of users, leave it out.
- Test through the public interface: parse plus render. Don't test internals.
- Rendering never throws. Problems go in `meta.issues`, one sentence each that names the block and the fix. Every plugin appends to the list and never replaces it, since several run on one document.
- Comments are rare and explain why, never what.
- Every build runs publint, so a package whose `exports`, `files`, or types don't resolve fails to build. Svelte entries ship as source with a hand-written `index.d.ts`; keep it in step with the components' props.
- `pnpm ready` formats, lints, typechecks, builds, tests, and runs Vite Doctor with the strict TypeScript preset (each package's `doctor.config.json`). Run it before opening a PR; CI runs the same steps.
- Use conventional commit titles. uppt builds the release from them (see Releasing below).
- Never comment on issues or pull requests without explicit consent.

## Releasing

uppt opens a draft `release/vX.Y.Z` PR from conventional commits on `main`, in lockstep for every package matched by `packages/*`. Merging it tags the version and stages each package on npm through OIDC; Maxi approves them on npmjs.com with 2FA. A new package needs a trusted publisher on npmjs.com before its first release, with workflow `release.yaml` and environment `npm`. If staging fails after the tag exists, run `gh workflow run release.yaml --repo onmax/comark-plugins --ref vX.Y.Z`. The docs deploy through Cloudflare Workers Builds on every push to `main`.

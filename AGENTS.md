# comark-plugins

Comark plugins for review documents: annotated screenshots and before/after comparisons. Agents write most of the documents they render, often as PR evidence. Because of that, the issue messages are as important as the HTML: every one names its block and says how to fix it.

## Shape

A pnpm workspace. Every package in `packages/` is published to npm under its own name, and all of them share one version.

- `packages/annotate` is `comark-annotate`.
  - `src/read.ts` reads `::screenshot`, `::compare`, and `::annotation` nodes and reports their issues. The plugin and the renderer both go through it, so they can't disagree.
  - `src/index.ts` is the parse plugin. It writes `meta.annotateIssues`.
  - `src/html.ts` is the `@comark/html` renderer. The output is static HTML with no script, and the styles are inlined once per document.
  - `src/marks.ts` holds the hand-drawn marks, taken from AnnotationKit.
- `packages/zoom` is `comark-zoom`.
  - `src/index.ts` is the parse plugin. It marks content images and adds one `zoom-runtime` node to a document with anything to zoom.
  - `src/client.ts` is the browser script. `start()` is self-contained because the HTML renderer inlines its source; Vue, React, and Svelte components call it on mount and stop it on unmount.
  - `src/html.ts`, `src/vue.ts`, `src/react.ts`, and `src/svelte/` are the renderers. They all output the same markup.
- `docs/` builds the docs site with the plugins themselves. Cloudflare serves it from `docs/dist`.

## Rules

- Follow the 90/10 rule. If a feature would take most of the code for a small share of users, leave it out.
- Test through the public interface: parse plus render. Don't test internals.
- Rendering never throws. Problems go in `meta.annotateIssues`.
- Comments are rare and explain why, never what.
- `pnpm ready` formats, lints, typechecks, builds, tests, and runs Vite Doctor with the strict TypeScript preset (each package's `doctor.config.json`). Run it before opening a PR; CI runs the same steps.
- Use conventional commit titles. uppt builds the release from them (see Releasing below).
- Never comment on issues or pull requests without explicit consent.

## Releasing

uppt opens a draft `release/vX.Y.Z` PR from conventional commits on `main`, in lockstep for every package matched by `packages/*`. Merging it tags the version and stages each package on npm through OIDC; Maxi approves them on npmjs.com with 2FA. A new package needs a trusted publisher on npmjs.com before its first release. If staging fails after the tag exists, run `gh workflow run release.yml --repo onmax/comark-plugins --ref vX.Y.Z`. The docs deploy through Cloudflare Workers Builds on every push to `main`.

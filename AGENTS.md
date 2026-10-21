# comark-plugins

Comark plugins for review documents: annotated screenshots, before/after comparisons, suggested code changes, and charts. Agents write most of the documents they render, often as PR evidence. Because of that, the issue messages are as important as the HTML: every one names its block and says how to fix it.

## Shape

A pnpm workspace. Every package in `packages/` is published to npm under its own name, and all of them share one version.

- `packages/annotate` is `comark-annotate`.
  - `src/read.ts` reads `::screenshot`, `::compare`, `::diff`, and `::annotation` nodes and reports their issues. The plugin and the renderer both go through it, so they can't disagree.
  - `src/index.ts` is the parse plugin. It appends its problems to `meta.issues`.
  - `src/html.ts` is the `@comark/html` renderer. The output reads without a script; the zoom and carousel scripts and all styles are inlined once per document. A screenshot zooms with `comark-zoom`, and `::compare` is a two-column `comark-carousel`. Marks are not links, so a click anywhere on a screenshot zooms it. `::diff` is a table of before and after lines with no script, and doesn't zoom: its code scrolls in place.
  - Only the HTML renderer exists: notes are Markdown, and Vue, React, and Svelte versions would each copy the whole figure template.
  - `src/marks.ts` holds the hand-drawn marks, taken from AnnotationKit.
  - `readMark` (from the root entry) and `annotateHtml` (from `/html`) are public so comark-charts can mark charts: one checks an annotation's mark, color, side, and note without its box, and the other draws annotations over any HTML.
- `packages/carousel` is `comark-carousel`. Its parse plugin turns `::carousel` content into explicit `slide` nodes with their position, so no renderer splits children. Its script is built like zoom's, and a carousel is a zoom gallery.
- `packages/charts` is `comark-charts`.
  - `src/read.ts` reads a `::chart` node and its Markdown table and reports their issues. The plugin (`src/index.ts`) and the renderer both go through it; the parse tree keeps the table as the data, so agents reading the Markdown or the page get numbers, not a spec.
  - `src/draw.ts` turns the table into a Flint spec with a house theme and draws it to SVG with Vega, when rendering, so the parse plugin stays light. Field names are fixed (`x`, `y`, `series`) because Vega-Lite reads dots in a name as a path.
  - `src/styles.ts` swaps the SVG's inks for the `--comark-*` tokens and `--chart-N` with attribute selectors, since CSS beats presentation attributes. Keep `INK` and `SERIES` in `draw.ts` in step with it.
  - Marks are comark-annotate annotations with `at` (a row's x) and `series` instead of a box. `read.ts` checks them with annotate's `readMark`; `draw.ts` finds each one's box in Vega's scenegraph (lines and areas get an invisible point layer) and `html.ts` draws them with annotate's `annotateHtml`, so they look and behave like marks on a screenshot. annotate skips `::chart` blocks when it checks annotations.
  - Only the HTML renderer exists: Vega draws on the server, and a framework component would ship it to the browser.
  - `skills/comark-charts/SKILL.md` is its agent skill. `docs/build.ts` serves every package's skill for `npx skills add`; add a new skill's folder there.
- `packages/embed` is `comark-embed`. Its parse plugin reads the player's `src` from the `::embed` link alone, with no fetch, and replaces the node's attributes with `provider`, `src`, `label`, `size`, `href`, `title`, and `host`, so no renderer parses URLs. `src/providers.ts` holds one entry per provider. A link with no player becomes a card, and one that isn't https renders nothing. No script: the components add the styles on mount.
- `packages/github-callouts` is `comark-github-callouts`. Its parse plugin is named `alert`, so Comark's dedupe swaps it in for the built-in alert plugin and it always sees the raw `[!TYPE]` marker. It turns those blockquotes into `github-callout` nodes with `type` and `title`; the renderers only draw them. No script: the components add the styles on mount.
- `packages/lint` is `comark-lint`, a library, CLI, and Vite Doctor extension that lints Comark documents.
  - `src/index.ts` is `lint()`. Comark gives nodes no positions, so block components take their line from markdown-exit tokens (plus the stripped frontmatter's lines) and everything else is found by searching the source with fenced code blanked out.
  - `src/config.ts` loads the other packages in this repo through optional dynamic imports; they are optional peer dependencies. Add a new package there.
  - `src/doctor.ts` is `comark-lint/doctor`. Vite Doctor has no Markdown visitor, so its Rules are manifest Rules that glob the Markdown in `onProjectEnd`. The root `doctor.config.ts` lints `docs/pages` with it as part of `pnpm run doctor`.
- `packages/tabs` is `comark-tabs`. Its parse plugin turns `::code-group` into `::tabs` and gives each `tabs-item` its label and position, and the `tabs` node every label and a `uid` from a hash of the source, so no renderer splits children and the HTML renderer's ids differ between documents on one page. Its script is built like carousel's.
- `packages/zoom` is `comark-zoom`.
  - `src/index.ts` is the parse plugin. It marks content images and adds one `zoom-runtime` node to a document with anything to zoom.
  - `src/script.ts` is the browser script. `script()` is self-contained because the HTML renderer inlines its source. `src/client.ts` exports `start()`, which runs it with the bundled styles; Vue, React, and Svelte components call it on mount and stop it on unmount.
  - `src/theme.ts` resolves the shared `--comark-*` tokens, and `comark-zoom/theme` exports it alone. `comark-github-callouts`, `comark-embed`, and `comark-tabs` have it as a dev dependency and bundle only this entry, so they don't install zoom or carry its styles.
  - `src/html.ts`, `src/vue.ts`, `src/react.ts`, and `src/svelte/` are the renderers. They all output the same markup.
- `docs/` builds the docs site with the plugins themselves. Cloudflare serves it from `docs/dist`. Each package has a folder in `docs/pages/` with an overview, getting started, components or syntax, and guides; `docs/build.ts` lists the sections. `docs/play.ts` is the playground, bundled with Vite; its presets are the examples at the top of each page.

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

uppt opens a draft `release/vX.Y.Z` PR from conventional commits on `main`, in lockstep for every package matched by `packages/*`. Merging it tags the version and publishes each package to npm through OIDC trusted publishing, with no approval step. A new package needs a trusted publisher on npmjs.com before its first release, with workflow `release.yaml`, environment `npm`, and `npm publish` allowed. If publishing fails after the tag exists, run `gh workflow run release.yaml --repo onmax/comark-plugins --ref vX.Y.Z`. The docs deploy through Cloudflare Workers Builds on every push to `main`.

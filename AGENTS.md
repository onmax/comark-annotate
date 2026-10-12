# comark-annotate

A Comark plugin for annotated screenshots and before/after comparisons. Agents write most of the documents it renders, often as PR evidence. Because of that, the issue messages are as important as the HTML: every one names its block and says how to fix it.

## Shape

- `src/read.ts` reads `::screenshot`, `::compare`, and `::annotation` nodes and reports their issues. The plugin and the renderer both go through it, so they can't disagree.
- `src/index.ts` is the parse plugin. It writes `meta.annotateIssues`.
- `src/html.ts` is the `@comark/html` renderer. The output is static HTML with no script, and the styles are inlined once per document.
- `src/marks.ts` holds the hand-drawn marks, taken from AnnotationKit.

## Rules

- Follow the 90/10 rule. If a feature would take most of the code for a small share of users, leave it out.
- Test through the public interface: parse plus render. Don't test internals.
- Rendering never throws. Problems go in `meta.annotateIssues`.
- Comments are rare and explain why, never what.
- `pnpm ready` formats, lints, typechecks, builds, tests, and runs Vite Doctor with the strict TypeScript preset (`doctor.config.json`). Run it before opening a PR; CI runs the same steps.
- Use conventional commit titles. uppt builds the release from them (see Releasing below).
- Never comment on issues or pull requests without explicit consent.

## Releasing

uppt opens a draft `release/vX.Y.Z` PR from conventional commits on `main`. Merging it tags the version and stages the package on npm through OIDC; Maxi approves it on npmjs.com with 2FA. If staging fails after the tag exists, run `gh workflow run release.yml --repo onmax/comark-annotate --ref vX.Y.Z`. The docs deploy through Cloudflare Workers Builds on every push to `main`.

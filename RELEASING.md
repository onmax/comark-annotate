# Release comark-annotate

The package uses [uppt](https://github.com/danielroe/uppt) to open release PRs and stage `comark-annotate` on npm. A maintainer reviews the release PR, then approves the staged package on npm before anyone can install it.

## Configure publishing once

1. In **Settings → Actions → General → Workflow permissions**, enable **Allow GitHub Actions to create and approve pull requests**.
2. Create a GitHub environment named `npm`. If you restrict its deployment tags, allow both `v*` and `release-*`.
3. The package must exist on npm before it can have a trusted publisher. Run `npx setup-trusted-publishing` to publish a `0.0.0` placeholder.
4. In the package's npm access settings, add a GitHub Actions trusted publisher: owner `onmax`, repository `comark-annotate`, workflow `release.yml`, environment `npm`. Enable the `npm stage publish` permission.
5. For Pullfrog, install the Pullfrog GitHub App on the repository and add the `CLIPROXY_API_KEY`, `CLIPROXY_CF_ACCESS_CLIENT_ID`, and `CLIPROXY_CF_ACCESS_CLIENT_SECRET` secrets.
6. For the docs, connect the repository to Cloudflare Workers Builds with build command `pnpm docs:build` and deploy command `npx wrangler deploy`. `wrangler.jsonc` serves `docs/dist` at `comark-annotate.onmax.me`.

The release workflow uses `GITHUB_TOKEN` and npm OIDC trusted publishing. It needs no npm token secret.

## Release a version

1. Merge into `main` with conventional commit titles such as `fix: ...` or `feat: ...`. On every push, uppt creates or updates a draft `release/vX.Y.Z` PR from the changes since the last release.
2. Review the proposed version and release notes, mark the PR ready, and merge it.
3. The Release workflow verifies the merged commit with formatting, build, lint, tests, and the docs build. Release PRs created with `GITHUB_TOKEN` may not trigger normal PR CI, so this check runs before tagging.
4. The workflow tags the version, creates the GitHub release, and dispatches itself on the tag. That run verifies the tag again, packs the package, and stages the tarball on npm with provenance.
5. Approve the staged version on npm with 2FA, then check the version and dist-tag. A GitHub release alone does not mean the package is installable.

Every branch and PR also gets a preview package through `pkg-pr-new`.

## Recover a failed release

If the tag exists but packing or staging failed, dispatch the workflow on that exact tag:

```sh
gh workflow run release.yml --repo onmax/comark-annotate --ref vX.Y.Z
```

Before retrying, check whether npm already has the version staged or published. Approve an existing staged version rather than staging it twice. A version that is already published needs a new version number.

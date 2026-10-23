---
title: comark-linter
description: Finds unclosed blocks, unknown components, broken links and anchors, local URLs, and plugin issues in Comark documents.
tagline: Check Comark documents before they publish, from a script, the command line, or Vite Doctor. Every message names the block and says how to fix it.
install: pnpm add -D comark-linter
group: Authoring tools
icon: list-checks
blurb: Catches what Comark forgives
---

Comark forgives a lot: it closes a `::` block you forgot to close, reads a missing `}` as the end of the line, and renders a misspelled component as an empty element. lint-comark reports each of these, with its line, so whoever wrote the document, often an agent, can fix it.

```txt
docs/pigeons-vs-deploys.md:8:1 comark/unclosed-block `::compare` opened on line 8 is never closed. Add a line with `::` after its last child.
docs/pigeons-vs-deploys.md:12:1 comark/unknown-component `::screnshot` on line 12 is not a known component. Did you mean `screenshot`? Known: `annotation`, `compare`, `diff`, `screenshot`.
```

## Rules

### `comark/unclosed-block` {#comark0001}

A `::` block needs a closing line with the same number of colons. Comark closes it at the end of the document, or at the next closer of an outer block, so everything after it moves inside. Code and HTML blocks are skipped, since Comark reads them as text.

### `comark/unknown-component` {#comark0002}

A block or inline component that isn't in your components or HTML, with the closest known name when one is near. Comark renders an unknown component as an empty element.

### `comark/malformed-attributes` {#comark0003}

A `{` that opens attributes and is never closed, after a component, a `[span]`, a link, or an image. Comark reads the rest of the line as attributes. Also a key set twice in one `{…}`; Comark keeps only the last.

### `comark/broken-anchor` {#comark0004}

A `#fragment` link that matches no heading id or `{#id}` in the document it points at: the same one, another file (`./setup.md#install`), or a page a route serves (`/guide/setup/#install`). The message lists the ids that document has and the closest one. Fragments on external links aren't checked.

```txt
docs/index.md:9:3 comark/broken-anchor The link to `./setup.md#instal` on line 9 matches no heading or id in `docs/setup.md`. Did you mean `#install`? Ids there: `#setup`, `#install`.
```

Ids come from the same `headingIds` you render with; pass it if you change Comark's default, or `'nested'` ids look broken.

### `comark/invalid-frontmatter` {#comark0005}

Frontmatter that isn't valid YAML, on the line of the YAML error. Comark throws on it; lint-comark reports it and still checks the rest of the document.

### `comark/plugin-issue` {#comark0006}

Every problem a plugin adds to `meta.issues`, such as a screenshot without `alt` from comark-annotate. It's placed on the block the message names when the source shows where that is, and on line 1 otherwise.

### `comark/unsafe-url` {#comark0007}

A `javascript:`, `vbscript:`, or `data:` URL in an `href` or `src`. `data:` images are fine.

### `comark/broken-link` {#comark0008}

A link or image whose file doesn't exist, from `href` and `src` alike, so a screenshot whose `src` is missing counts. A link resolves the way a site serves it: `./setup` and `./setup/` find `setup.md` or `setup/index.md`. When a near name exists, the fix names it.

```txt
docs/index.md:12:1 comark/broken-link The image `./shots/after.png` on line 12 points at `docs/shots/after.png`, which doesn't exist. Did you mean `./shots/after.jpg`?
```

A relative link resolves from the document, and one that starts with `/` from the project root, as on GitHub. If your site serves `/guide/` from another folder, map it in [`links.routes`](/lint/getting-started/#links). It needs the document's path, so the command line and Vite Doctor check it, and `lint()` checks it when you pass `file`.

### `comark/blocked-url` {#comark0009}

A link that works only on the writer's machine or for a while: `localhost` and `*.localhost`, `127.0.0.0/8`, `::1`, `0.0.0.0`, private networks (`10/8`, `172.16/12`, `192.168/16`, `169.254/16`, `*.local`, `*.internal`), `file:` URLs, tunnels (ngrok, `*.trycloudflare.com`, `*.loca.lt`), and deploy previews (Netlify's `deploy-preview-42--site.netlify.app` and Vercel's `app-git-branch-team.vercel.app`). A production `*.vercel.app` or `*.netlify.app` host is fine.

Comark turns a bare URL in prose into a link, so `Open http://localhost:5173` is reported too. Write it as code, `` `http://localhost:5173` ``, when the address is the point.

```txt
docs/review.md:4:6 comark/blocked-url The link to `http://localhost:5173/` on line 4 points at the writer's own machine, so it opens nothing for anyone else. Link the deployed page, or write the address as code (`` `http://localhost:5173/` ``). Comark turns a bare URL in prose into a link.
```

It's on by default. `links.block` adds patterns, `links.allow` reports every host it doesn't list, and `links.skip` lets a link through.

### `comark/dead-url` {#comark0010}

An external URL that answers 404 or 410, whose host has no DNS record, or whose TLS certificate fails. It's off by default, since it needs the network: turn it on with `--check-urls` or `links.urls`.

```txt
docs/guide.md:20:1 comark/dead-url The link to `https://example.com/old` on line 20 answers 404 Not Found. Link the page where it moved, or its archived copy (`https://web.archive.org/web/https://example.com/old`). If the page is there and the site answers 404 anyway, add the URL to `links.skip`.
```

It sends a GET, the way a browser does, and stops reading once the headers arrive. A 401, 403, 429, or 999 means the site turns robots away, a 5xx is tried once more, and a timeout is a slow site, so none of those are reported; redirects aren't either, and nor are fragments on external pages. Requests to `github.com` carry `GITHUB_TOKEN` when it's set, so CI isn't rate-limited. Each URL is requested once per run, and the ones that worked are cached for a day. When the network is down, it prints one warning and reports nothing.

## Positions

Comark gives parsed nodes no source positions. lint-comark takes block components' lines from the parser's tokens and finds everything else by searching the source, so a component inside a paragraph gets its line and the first matching column, a URL is matched where it starts an attribute or link rather than in prose, and a repeated value is matched in order.

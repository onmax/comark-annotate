---
title: Options
description: What anchors() and external() take, and what they write.
---

## anchors()

| Option | Default | What it does |
| --- | --- | --- |
| `levels` | `[2, 3, 4]` | The heading levels that get a link |
| `label` | `Section titled "…"` | What screen readers hear for the link, from the heading's text |
| `icon` | `"#"` | What the link shows |

A heading needs an id for a link. Comark gives every heading one from its text, or the one you write with `{#id}`:

```md
## Install with pnpm {#install}
```

With `headingIds: false` and no `{#id}`, a heading gets no link.

Each heading with a link renders as Starlight's do:

```html
<div class="cl-heading">
  <h2 id="setup">Setup</h2>
  <a class="cl-anchor" href="#setup"><span aria-hidden="true">#</span><span class="cl-sr">Section titled "Setup"</span></a>
</div>
```

## external()

| Option | Default | What it does |
| --- | --- | --- |
| `target` | `false` | Where external links open, such as `"_blank"` |
| `rel` | `[]` | Words added to external links' `rel`, such as `["nofollow"]` |
| `hosts` | `[]` | Your own hosts, such as `"example.com"`, whose links count as internal |
| `test` | http and https links not on `hosts` | Which links are external, from their `href` |
| `icon` | `true` | Draws ↗ after a link that opens a new tab |
| `label` | `"(opens in a new tab)"` | What screen readers hear after that link; `""` leaves it out |

`noopener` joins `rel` whenever the target is `_blank`. A link keeps the `target` or `rel` you write on it:

```md
[Status page](https://status.example.com){target="_self"}
[My profile](https://mastodon.social/@onmax){rel="me"}
```

A `hosts` entry matches one host exactly, so list `www.example.com` and `docs.example.com` if you link to them. By default, links that start with `/`, `#`, or `mailto:` are never external.

When a link to another site opens a new tab, from `target` or from your own `{target}`, it ends with the warning:

```html
<a href="https://example.com" target="_blank" rel="noopener">Docs<span class="cl-icon" aria-hidden="true">↗</span><span class="cl-sr">(opens in a new tab)</span></a>
```

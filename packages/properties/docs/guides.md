---
title: Guides
description: Review documents with a status, and theming.
---

## Review documents with a status

Agents that write review documents can keep the facts a reviewer scans for in the frontmatter, where a script can read them too, and the box shows them on the page:

```md
---
status: Changes requested
pr: https://github.com/onmax/comark-ui/pull/111
author: claude
date: 2026-10-23
tags: [colors, docs]
---
```

Choose the keys with the `keys` option, so the same frontmatter can carry fields that only your tooling reads.

## Icons beside the labels

Each row carries its key in `data-key`, so CSS can put an icon before a label without a plugin. This one draws [Lucide](https://lucide.dev) icons from the Iconify API as masks, so they take the label's color:

```css
.cfm dt::before {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-inline-end: 0.375rem;
  vertical-align: -0.125em;
  background: currentColor;
  mask: var(--key-icon, linear-gradient(transparent 0 0)) center / contain no-repeat;
}

.cfm [data-key="status"] { --key-icon: url("https://api.iconify.design/lucide/circle-dot.svg"); }
.cfm [data-key="pr"] { --key-icon: url("https://api.iconify.design/lucide/git-pull-request.svg"); }
.cfm [data-key="author"] { --key-icon: url("https://api.iconify.design/lucide/user.svg"); }
.cfm [data-key="date"] { --key-icon: url("https://api.iconify.design/lucide/calendar.svg"); }
.cfm [data-key="tags"] { --key-icon: url("https://api.iconify.design/lucide/tags.svg"); }
```

A key with no icon gets a transparent mask, so its room stays empty and the labels still line up. [A pull request description](/recipes/pull-request/) puts the box together with icons, numbers, and a test run.

## Theming

The box reads the [shared tokens](/guide/theming/): `--comark-background`, `--comark-foreground`, and `--comark-border` for the box, `--comark-muted` for the labels, `--comark-accent` behind badges, `--comark-ring` for focus rings, `--comark-radius` for corners, and `--comark-font`. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cfm` | The box, a `dl` with one `div` of `dt` and `dd` per key, each with `data-key` |
| `.cfm-tag` | A badge of a list |

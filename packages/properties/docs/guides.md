---
title: Guides
description: Review documents with a status, and theming.
---

## Review documents with a status

Agents that write review documents can keep the facts a reviewer scans for in the frontmatter, where a script can read them too, and the box shows them on the page:

```md
---
status: Changes requested
pr: https://github.com/onmax/comark-plugins/pull/111
author: claude
date: 2026-10-23
tags: [colors, docs]
---
```

Choose the keys with the `keys` option, so the same frontmatter can carry fields that only your tooling reads.

## Theming

The box reads the [shared tokens](/guide/theming/): `--comark-background`, `--comark-foreground`, and `--comark-border` for the box, `--comark-muted` for the labels, `--comark-accent` behind badges, `--comark-ring` for focus rings, `--comark-radius` for corners, and `--comark-font`. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cfm` | The box, a `dl` with one `div` of `dt` and `dd` per key, each with `data-key` |
| `.cfm-tag` | A badge of a list |

---
title: Syntax
description: Inline and block badges, their colors, and the issues they report.
---

```md
:badge[deprecated]{color="warning"}

::badge
**v4.0.0**
::
```

Write a badge inline, with its text in brackets, or as Nuxt UI's block `::badge` with its content inside. A block badge's paragraph is unwrapped, so it renders as one badge.

| Prop | What it does |
| --- | --- |
| `color` | One of `primary`, the default, `secondary`, `success`, `info`, `warning`, `error`, and `neutral`. |

Nuxt UI's prose badge is always primary. The `color` prop is this plugin's own, and Nuxt UI ignores it.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A `color` it doesn't know. The badge shows as primary, and the issue lists the colors it knows.
- A prop it doesn't read.
- An empty badge.

Each issue names its badge by its text and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

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

Nuxt UI's prose badge is always primary; the `color` prop is this plugin's, and Nuxt UI ignores it.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a `color` it doesn't know, which shows as primary and lists the ones it does, a prop it doesn't read, and an empty badge. Each issue names its badge by its text and says how to fix it, and each has its own rule in [Doctor](/doctor/).

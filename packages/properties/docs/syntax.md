---
title: Syntax
description: Where the box goes, and how each value shows.
---

The box goes at the top of the document, before anything else. To put it somewhere else, such as under the title, write `::properties` there:

```md
# Loft redesign

::properties
::
```

| Value | Shows as |
| --- | --- |
| Text, a number, `true` or `false` | Itself. A date such as `2026-10-23` stays as written. |
| A GitHub or GitLab pull request, merge request, or issue link | `owner/repo#123`, linked |
| Any other `http(s)` link | Its host and path, linked |
| A list | One badge per item |

A key that's missing or empty is skipped, and a document with none of the keys gets no box.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a value that's an object or a list of lists (it isn't shown), a `::properties` with nothing to show, content inside it (it's dropped), and a prop on it (it's ignored). Each issue names the key or block and says how to fix it, and each has its own rule in [Doctor](/doctor/).

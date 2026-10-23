---
title: Guides
description: Badges in headings, the node it writes, and theming.
---

## Badges in headings

A badge in a heading sits on the heading's line, a little smaller than its text. The heading's `id` takes the badge's words too, as Comark builds ids from all of a heading's text: `## useFetch :badge[deprecated]` links as `#usefetch-deprecated`.

::example
```md
### refresh() :badge[new]{color="success"}
```
::

## Your own renderer

The parse plugin replaces each badge's attributes with its `color`, `primary` unless it set a known one, and keeps only its content:

```json
["badge", { "color": "warning" }, "deprecated"]
```

`colors`, exported from every entry, lists the seven colors.

## Theming

A badge is a `<span class="cb" data-color="...">`. Each color reads Nuxt UI's variable, such as `--ui-warning`, then its own default. Primary's default is shadcn/ui's `--primary`, then the foreground, so badges match the page's brand color or stay neutral without one. Secondary's is the muted text color, and error's is `--destructive`. Set `--cb-primary`, `--cb-secondary`, `--cb-success`, `--cb-info`, `--cb-warning`, `--cb-error`, or `--cb-neutral` on `.cb` to change one. Badges also read these [shared tokens](/guide/theming/):

Badges also read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-foreground` | Mixed into the text, so it stays readable |
| `--comark-muted` | Neutral badges |
| `--comark-radius` | Corners |
| `--comark-font` | Text |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

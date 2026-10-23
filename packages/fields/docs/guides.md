---
title: Guides
description: Hiding optional fields, the node it writes, and theming.
---

## Hiding optional fields

A long list of options reads better with the rarely used ones folded away. With comark-details, put them in a `::collapsible`, as Nuxt UI's docs do:

```md
::field{name="options" type="object"}
:::collapsible{name="options"}
::::field{name="sync" type="string"}
A key shared by blocks that switch together.
::::
:::
::
```

## Your own renderer

The parse plugin replaces each field's attributes with the ones it renders from, all strings, and keeps its content:

```json
["field", { "name": "options", "type": "object", "required": "true", "default": "{}" },
  ["p", {}, "What the plugin takes."],
  ["field", { "name": "sync", "type": "string" }, "A key."]]
```

## Theming

A field is a `<div class="cfl">` with a `.cfl-head` holding `.cfl-name`, `.cfl-type`, `.cfl-required`, and `.cfl-default`, then its content in `.cfl-body`. A group is a `<div class="cfl-group">`. They read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-foreground` | Names |
| `--comark-muted` | Types, defaults, descriptions |
| `--comark-border` | The lines between fields, the guide line beside an object's properties |
| `--comark-radius` | The required tag's corners |
| `--comark-font` | Text |

The required tag takes shadcn/ui's `--destructive`, or red without it; set `--cfl-required` on `.cfl` to change it. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

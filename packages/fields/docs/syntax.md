---
title: Syntax
description: Fields and field groups, their props, and the issues they report.
---

```md
::field-group
:::field{name="options" type="object" required default="{}"}
What the plugin takes.

::::field{name="sync" type="string"}
A key shared by blocks that switch together.
::::
:::
::
```

| Prop | What it does |
| --- | --- |
| `name` | Required. The prop, option, or parameter, shown in code. |
| `type` | Its type, as you'd write it in TypeScript. |
| `required` | Adds a required tag. Comark writes a bare `required` as `:required="true"`, and `:required="false"` leaves it off. |
| `default` | Its default, shown in code. `:default="0"` and `:default='{"a":1}'` show as written. |
| `description` | The text shown when the field has no content of its own. |

The content inside a `::field` is its description, and `:::field` blocks inside it describe an object's properties. `::field-group` sets fields one under another with a line between them. A field works on its own too.

This is Nuxt UI's syntax. Nuxt UI's field has no `default`, so it ignores that prop.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A field without a `name`.
- A prop it doesn't read.
- A `description` prop on a field with content, which hides the prop.

Each issue names the field, by its name or else its type, and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

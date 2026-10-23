---
title: comark-fields
description: Props, options, and parameters, written in Markdown.
tagline: List a component's props or a function's options with their types, defaults, and whether they're required, with an object's properties nested under it. Nuxt UI's syntax, with no script.
install: pnpm add comark @comark/html comark-fields
group: Docs blocks
icon: list-tree
blurb: Props and options
credits: 'Syntax from <a href="https://ui.nuxt.com/docs/typography">Nuxt UI</a>''s prose fields.'
---

::examples
:::example{label="Props"}
```md
::field-group
:::field{name="title" type="string" required}
The text above the card's content.
:::

:::field{name="color" type="string" default="primary"}
Tints the icon and the hovered border.
:::
::
```
:::

:::example{label="Nested"}
```md
::field{name="options" type="object"}
What the plugin takes.

:::field{name="iconResolver" type="Icons"}
Resolves icons, from `createIcons()` in comark-icon.
:::

:::field{name="download" type="boolean" default="true"}
Inlines each image while parsing.
:::
::
```
:::
::

Each field is a row: its name in code, its type, a required tag, its default, and its description under them. Fields inside a field describe an object's properties and sit indented under it.

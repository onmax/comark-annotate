---
title: Syntax
description: Details, accordions, and collapsibles, their props, and the issues they report.
---

## Details

```md
::details{summary="Why?" open}
Because.
::
```

Or give the summary in a slot, where it can hold Markdown:

```md
::details
#summary
Why **pnpm**?

#default
It saves disk.
::
```

| Prop | What it does |
| --- | --- |
| `summary` | The text that shows while it's closed. A `#summary` slot wins over it. |
| `open` | Starts it open. |
| `icon` | An icon before the summary. |

## Accordion

```md
::accordion{type="single" :defaultValue='["0"]'}
:::accordion-item{label="Is it free?" icon="lucide:badge-dollar-sign"}
Yes.
:::

:::accordion-item{label="Where's the source?" description="On GitHub."}
:::
::
```

| Prop | What it does |
| --- | --- |
| `type` | `multiple`, the default, lets every item open at once. `single` gives the items one `name`, so opening one closes the others, which [every current browser](https://caniuse.com/mdn-html_elements_details_name) does. |
| `defaultValue` | The items that start open, by position from 0, as Nuxt UI takes them: `:defaultValue='["0", "2"]'`, or `defaultValue="1"` for one. A single accordion opens only the first. |

Each `:::accordion-item` takes `label`, the summary, `icon`, and `description`, the text shown when the item has no content of its own.

## Collapsible

```md
::collapsible{name="options" openText="Show" closeText="Hide"}
Anything.
::
```

The summary reads "Show options" while it's closed and "Hide options" while it's open. `name` defaults to "properties", and `icon` sets an icon before it. Without the styles, it reads "options" alone.

This is Nuxt UI's syntax, unchanged, so a page renders the same accordions and collapsibles under Nuxt UI.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A `::details` with no summary shows "Details".
- Content in an `::accordion` outside every `:::accordion-item` doesn't render, and an accordion with no items is reported.
- An item without a `label`, a `defaultValue` that isn't an item's position, and a `type` that isn't `single` or `multiple`.
- An `:::accordion-item` outside `::accordion` renders on its own.
- An empty `::collapsible`, and an icon comark-icon can't draw.

Each issue names its block and says how to fix it.

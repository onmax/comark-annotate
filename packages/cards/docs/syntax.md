---
title: Syntax
description: Cards, card groups, and columns, their props, and the issues they report.
---

## Cards

```md
::card-group
:::card{title="Guides" description="Start here." icon="lucide:book-open" to="/guides/"}
:::

:::card
#title
The `api` route

#default
Every option it takes.
:::
::
```

| Prop | What it does |
| --- | --- |
| `title` | The card's title. A `#title` slot wins over it, and can hold Markdown. |
| `description` | The text shown when the card has no content of its own. |
| `icon` | An icon above the title, in the card's color. |
| `to` | Makes it a link card. A web address opens in a new tab with an arrow in the corner. |
| `target` | Where the link opens, such as `_self` to keep a web address in the tab. |
| `color` | Tints the icon and a hovered link card's border: `primary`, the default, `secondary`, `success`, `info`, `warning`, `error`, or `neutral`. |

`::card-group` sets its cards in two columns, one on narrow screens. A card works on its own too.

## Columns

```md
::columns{cols="3"}
First cell.

:::column
Second cell, with

two paragraphs.
:::

Third cell.
::
```

Each block directly inside is a cell, and `:::column` groups several blocks into one. `cols` is 1 to 6, 2 by default, and every row stacks into one column on narrow screens.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- `href` instead of `to`. The card still links, but Nuxt UI ignores `href`, so the issue says to write `to`.
- A `to` that runs a script, such as `javascript:`, which doesn't link.
- A `color` it doesn't know, which shows as primary.
- A `cols` outside 1 to 6, an empty `::columns`, and an icon comark-icon can't draw.
- A prop `::card` or `::columns` doesn't read, such as `link` or `columns`, which is ignored.

Each issue names its block, by its title when it has one, and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

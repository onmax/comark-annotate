---
title: Components
description: tabs, tabs-item, and code-group, and the props each takes.
---

## tabs

Each `:::tabs-item` inside `::tabs` is a tab, named by its `label`.

::example
```md
::tabs
:::tabs-item{label="Preview"}
The rendered page.
:::

:::tabs-item{label="Source"}
The Markdown behind it.
:::
::
```
::

| Prop | |
| --- | --- |
| `sync` | A key shared by blocks that switch together. Picking a tab picks the tab with the same label in every block with that key, now and on the next visit. |

## tabs-item

One tab. It holds any Markdown, even other tabs.

| Prop | |
| --- | --- |
| `label` | The tab's name, required. Labels in one block must differ. |

## code-group

Code blocks as tabs, each named by the label in brackets after its language. The label becomes the tab, so the code block doesn't repeat it, and the tabs sit in a header joined to the block. Without a script, each block keeps its label as a header of its own.

::example
````md
::code-group{sync="pm"}
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```
::
````
::

| Prop | |
| --- | --- |
| `sync` | As on `::tabs`. A code group and tabs with the same key switch together. |

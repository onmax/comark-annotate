---
title: Components
description: tabs, tabs-item, and code-group, and the props each takes.
---

## tabs

Each `:::tabs-item` inside `::tabs` is a tab, named by its `label`.

::example
```md
::tabs
:::tabs-item{label="This week"}
14 rubber ducks bought, 14 bugs fixed.
:::

:::tabs-item{label="Last week"}
3 rubber ducks bought, 3 bugs fixed.
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
| `icon` | An [Iconify](https://icones.js.org) name such as `lucide:apple`, or an image URL, drawn by [comark-icon](/icon/) before the label. See [Icons](/tabs/guides/#icons). |

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

A code block takes an icon after its label, as `icon=logos:pnpm`.

## npm2yarn

A code block with `npm2yarn` after its language holds npm commands and becomes a code group with a tab for each package manager: npm, pnpm, yarn, and bun. It has `sync="pm"`, so it switches with the code groups you write with that key.

::example
````md
```sh npm2yarn
npm install -D comark-tabs
npx nuxi@latest module add ui
```
````
::

Only lines that start with `npm` or `npx`, or commands after `&&`, `||`, or `;`, change, so `cd my-npm-app` stays as written. [npm-to-yarn](https://github.com/nebrelbug/npm-to-yarn) converts them, and bun's tab writes `bunx` and `bun create` as Bun's docs do. In a `::code-group` the block is one tab already, and `npm2yarn` does nothing. Set the managers with the [`managers` option](/tabs/guides/#package-managers).

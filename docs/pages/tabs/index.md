---
title: comark-tabs
description: Tabs and code groups, written in Markdown.
tagline: Tabs of any content, and code blocks grouped by package manager or language, that switch together across the page.
install: pnpm add comark @comark/html comark-tabs
---

::examples
:::example{label="Tabs"}
```md
::tabs{sync="os"}
:::tabs-item{label="macOS"}
Press **⌘K** to search.
:::

:::tabs-item{label="Windows"}
Press **Ctrl+K** to search.
:::
::
```
:::

:::example{label="Code group"}
````md
::code-group{sync="pm"}
```sh [pnpm]
pnpm add comark-tabs
```

```sh [npm]
npm install comark-tabs
```

```sh [yarn]
yarn add comark-tabs
```
::
````
:::
::

Without a script, every tab shows under its label, one after another. The script adds the tab strip, the arrow keys, and `sync`, which switches every block with the same key at once and remembers the choice.

## Credits

The syntax follows [Nuxt UI](https://ui.nuxt.com)'s tabs and code groups.

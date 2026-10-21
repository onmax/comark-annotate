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
Press **⌘K** to find the pigeon data.
:::

:::tabs-item{label="Windows"}
Press **Ctrl+K** to find the pigeon data.
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

:::example{label="Icons"}
````md
::code-group{sync="pm"}
```sh [pnpm] icon=vscode-icons:file-type-pnpm
pnpm add comark-tabs
```

```sh [npm] icon=vscode-icons:file-type-npm
npm install comark-tabs
```

```sh [bun] icon=vscode-icons:file-type-bun
bun add comark-tabs
```
::
````
:::
::

Without a script, every tab shows under its label, one after another. The script adds the tab strip, whose highlight slides to the tab you pick, the arrow keys, and `sync`, which switches every block with the same key at once and remembers the choice.

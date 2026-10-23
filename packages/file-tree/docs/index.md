---
title: comark-file-tree
description: A project's folders and files, written in Markdown.
tagline: Indent the paths, or paste what `tree` prints, and get a tree of folders and files with what changed marked and a note on any line.
install: pnpm add comark @comark/html comark-file-tree
group: Docs blocks
icon: folder-tree
blurb: Folders and files
credits: 'After <a href="https://starlight.astro.build/components/file-tree/">Starlight</a>''s file tree. Glyphs from <a href="https://lucide.dev">Lucide</a>, and icons from <a href="https://github.com/vscode-icons/vscode-icons">vscode-icons</a> through comark-icon.'
---

::examples
:::example{label="Indented"}
````md
::file-tree
```
src/
  components/
    Button.vue  # the one every page uses
    ...
  pages/
    [slug].vue
  app.config.ts
package.json
```
::
````
:::

:::example{label="What changed"}
````md
::file-tree
```
packages/
  steps/
    + src/
      + index.ts  # the parse plugin
    ~ package.json
    - legacy.ts  # folded into index.ts
```
::
````
:::

:::example{label="From tree"}
````md
::file-tree
```
.
├── docs
│   └── index.md
├── src
│   └── __init__.py
└── pyproject.toml

2 directories, 3 files
```
::
````
:::
::

The tree is written in a fenced block, so names stay as they are: `__init__.py` isn't bold and `[slug].vue` isn't a span. Folders are open `<details>`, so a reader folds the ones they don't need with no script.

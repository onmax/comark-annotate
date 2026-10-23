---
title: Guides
description: Icons of your own, the node it writes, and theming.
---

## Icons of your own

`icons` maps a file name, an extension, or `name/` for a folder to any icon comark-icon resolves, on top of the built-in ones. `folder` and `file` set the fallbacks:

```ts
import { createIcons } from "comark-icon";
import fileTree from "comark-file-tree/html";

fileTree({
  iconResolver: createIcons(),
  icons: {
    "nuxt.config.ts": "vscode-icons:file-type-nuxt",
    ".vue": "logos:vue",
    "docs/": "lucide:book-open",
    file: "lucide:file",
  },
});
```

A name wins over an extension. An icon that doesn't resolve leaves its entry with the plain glyph.

## Your own renderer

The parse plugin replaces the block with a `file-tree` node holding one `file-tree-item` per entry, nested as the folders are:

```json
["file-tree", {},
  ["file-tree-item", { "type": "folder", "name": "src" },
    ["file-tree-item", { "type": "file", "name": "new.ts", "state": "added", "note": "added in this change" }],
    ["file-tree-item", { "type": "more" }]]]
```

`type` is `folder`, `file`, or `more`, `state` is `added`, `removed`, or `changed`, and `icon` is comark-icon's `IconData` when a resolver drew one.

## Theming

A tree is a `<div class="cft">` of nested `<ul>`s. Each entry is an `<li>` with `data-type` and `data-state`, and a folder's holds `<details open>`. They read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-background` | The box |
| `--comark-foreground` | Names |
| `--comark-muted` | Glyphs, notes, placeholders |
| `--comark-border` | The box, the guide line down each folder |
| `--comark-accent` | A hovered folder |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners |
| `--comark-font` | Notes |

Set `--cft-added`, `--cft-removed`, and `--cft-changed` on `.cft` to change the colors of marked entries; removed entries follow shadcn/ui's `--destructive` by default. The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the spacing that draws the tree: the margins, padding, and bullets of its lists, `details`, and `summary` are `!important`, because a page's own list styles are almost always unlayered and would push entries off their guide lines. Override those with `!important` too.

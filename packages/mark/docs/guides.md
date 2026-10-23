---
title: Guides
description: Styling highlights, and highlights in review documents.
---

## Styling

The plugin adds no classes and no styles. Browsers draw `<mark>` with a yellow background. To match your theme:

```css
mark {
  background: color-mix(in oklab, gold 40%, transparent);
  color: inherit;
  border-radius: 2px;
  padding: 0 2px;
}
```

A class after a highlight styles that one alone: `==Do not deploy=={.warning}` renders `<mark class="warning">`.

## In review documents

A highlight marks the words a reviewer should read first, such as the number that changed or the condition a fix adds. Keep it to a few words per paragraph; a highlighted paragraph is a paragraph nobody skims.

## How it parses

The parser is markdown-it-mark and markdown-it-sup, ported to TypeScript, since neither ships types. Comark drops inline tokens it doesn't know and keeps their text, so the plugin renames `mark_open` and `mark_close` to the inline span Comark builds with any tag. Comark already builds `sup`.

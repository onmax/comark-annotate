---
title: Guides
description: Styling a definition list, and when a table reads better.
---

## Styling

The plugin adds no classes and no styles. Browsers indent `<dd>`, and a prose stylesheet such as Tailwind Typography styles all three tags. To set terms in bold:

```css
dt {
  font-weight: 600;
}
dd + dt {
  margin-top: 1em;
}
```

## Lists or tables

A definition list reads better than a two-column table when definitions run longer than a line or hold more than a paragraph, since a table cell holds neither a list nor code. For short values side by side, such as options and defaults, a table is easier to scan.

## How it parses

The parser is markdown-it-deflist, ported so its tokens reach Comark's tree: Comark drops block tokens it doesn't know, so the plugin pushes ones it builds with any tag.

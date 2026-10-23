---
title: Syntax
description: The props of ::toc, and which headings it lists.
---

```md
::toc{depth=3 title="On this page"}
::
```

| Prop | What it does |
| --- | --- |
| `depth` | The deepest heading it lists, from 2 to 6. Default 3, so h2 and h3 headings. |
| `title` | A small title above the list, which also names the `nav` for screen readers. Without it the `nav` is named "Contents". |

The list starts at h2, since a page's h1 is usually its title. Each heading sits under the closest heading above it of a higher level, so a page that skips a level still nests sensibly. A heading's own id, such as `## Events {#on}`, is the one the link uses. A page can hold more than one `::toc`, and each lists the whole page.

`[[toc]]`, as markdown-it-toc writes it, isn't read: in Comark `[[...]]` is a span, and the block syntax is the one every other plugin uses.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a `depth` outside 2 to 6, content inside the block (it's dropped), and a page with no headings to list (it renders nothing). Each issue names its block and says how to fix it.

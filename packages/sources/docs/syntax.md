---
title: Syntax
description: Citations, the list of sources, and what each becomes.
---

## Citations

```md
Homing works by the sun :cite[1], and by smell :cite[2,3].
```

`:cite[n]` cites the nth source; `:cite[1,3]` cites several. Each becomes a superscript `[1]` that links to its source and shows the source's title on hover.

## Sources

```md
::sources{title="References"}
1. [Magnetoreception](https://en.wikipedia.org/wiki/Magnetoreception)
2. [Pigeon intelligence](https://en.wikipedia.org/wiki/Pigeon_intelligence), on smell
::
```

A `::sources` holds one numbered list, and each item is one source with its link. The list renders where the block sits, under a small title, `title` or "Sources", and each item gets a ↩ link back to each citation of it. A document has one list of sources.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a citation with no number, one of a source the list doesn't have, citations with no `::sources`, a second `::sources`, a list item without a link, content beside the list (it's dropped), and a prop it doesn't read. Each issue names its block and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

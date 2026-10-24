---
title: Guides
description: Validation, moving from Comark's footnotes plugin, and streaming.
---

## Validation

A reference with no definition, a definition nothing references, and a label defined twice each add a sentence to `meta.issues` that names the label and says how to fix it. Each one has its own rule in [Doctor](/doctor/).

```txt
footnotes: [^gone] has no definition; add a "[^gone]: …" line, or remove the reference.
footnotes: [^spare]: is never referenced; add [^spare] where it applies, or remove the definition.
footnotes: [^1]: is defined more than once, and only the first shows; give the others their own labels, or remove them.
```

## From Comark's footnotes plugin

Swap the import; the options and the nodes are the same, so the classes `footnote-ref`, `footnotes`, `footnotes-list`, and `footnote-backref` and the ids `fn-label` and `fnref-label` don't change. Three things render differently:

- A definition inside fenced code stays in the code. Comark's plugin removes every `[^label]:` line before parsing, code included.
- Markdown in a note renders. Comark's plugin keeps the note as text, so `**bold**` stays as written.
- A note can run over several lines and blocks. Comark's plugin keeps the first line, and its indented lines become a code block in the page.

A reference used twice gets the id `fnref-label-2` the second time, where Comark's plugin repeats `fnref-label`, and its note gets a link back to each reference. A note of several blocks is an `li` holding `p` elements, with the links back inside the last one.

Comark's `Footnote` handler for `renderMarkdown` reads the same nodes, so it writes a note of one paragraph back to `[^label]: …`. A note of several blocks comes back as its first block only.

## Streaming

A stream renders notes as they arrive: `^[an unfinished note` already shows as a note, and `[^label]` shows as text until its definition arrives. Blocks Comark reuses from the last parse keep their notes.

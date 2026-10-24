---
title: Syntax
description: The five CriticMarkup marks, and what each mode does with them.
---

| Mark | Markdown | Renders as |
| --- | --- | --- |
| Insertion | `{++added++}` | `<ins>added</ins>` |
| Deletion | `{--removed--}` | `<del>removed</del>` |
| Substitution | `{~~old~>new~~}` | `<del>old</del><ins>new</ins>` |
| Highlight | `{==this==}` | `<mark>this</mark>` |
| Comment | `{>>why<<}` | `<span class="ccm-comment">why</span>` |

A highlight followed by a comment, `{==east window==}{>>Not the west one.<<}`, reads as a comment on the highlighted text. Text inside a mark is Markdown, so it can hold `**bold**`, `` `code` ``, and links, and `{.class}` right after a mark sets its attributes.

Each mark opens and closes in one paragraph. Inside a code span it stays as written.

## Modes

| Mark | `view` | `accept` | `reject` |
| --- | --- | --- | --- |
| Insertion | `<ins>` | its text | nothing |
| Deletion | `<del>` | nothing | its text |
| Substitution | both | the new text | the old text |
| Highlight | `<mark>` | its text | its text |
| Comment | the span | nothing | nothing |

## Issues

A mark with no closing half in its paragraph stays as written, and the plugin adds a sentence to `meta.issues`, as it does for a substitution without `~>` and a `mode` it doesn't know. Each one has its own rule in [Doctor](/doctor/):

```txt
critic `{++` has no closing `++}` in its paragraph; close it there, or write `\{++` to keep the text.
critic `{~~old~~}` has no `~>` between the old and the new text; write `{~~old~>new~~}`.
```

Escape the brace, `\{++`, to write the characters themselves.

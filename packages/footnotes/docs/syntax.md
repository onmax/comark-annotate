---
title: Syntax
description: References, definitions over several lines and blocks, and inline notes.
---

A reference is `[^label]` with no spaces in the label. Its definition starts a line with `[^label]:`, anywhere in the document:

```md
The duck has a name[^name].

[^name]: Gerald.
```

Notes are numbered in the order they're first referenced, whatever their labels. A note referenced twice lists a link back to each reference.

## Long notes

Lines indented by four spaces continue a definition, as in a list item, so a note can hold several paragraphs, a list, or code. A line that isn't indented continues the paragraph above it:

````md
[^deploy]: Deploys stop on Friday at noon
and start again on Monday.

    Hotfixes still ship:

    ```sh
    deploy --hotfix --approvers 2
    ```
````

Markdown in a note renders as it does anywhere else. The note's links back go at the end of its last paragraph.

## Inline notes

`^[text]` is a note written where it applies, with no label. It's numbered with the rest:

```md
Standup is at 9:30^[Unless the pigeons are counted late.].
```

## What stays text

A reference with no definition stays as written, `[^label]`, and a definition inside code is code. `[^text](https://…)` is a link.

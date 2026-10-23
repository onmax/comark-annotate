---
title: Syntax
description: Terms, definitions, continuation lines, and tight and loose lists.
---

A term is one line. The line after it, or the one after a blank line, starts with `:` or `~` and at least one space:

```md
Retro
: A meeting about the sprint that just ended.
~ A font that looks like 1984.
```

A term can have several definitions, and a list several terms. Separate terms with a blank line, or a line right after a definition is read as more of that definition.

## Long definitions

Lines indented past the marker continue the definition. Leave a blank line between its blocks, as in a list item:

````md
Deploy freeze
:   No deploys from Friday noon to Monday.

    Hotfixes still ship, with two approvals.

    ```sh
    deploy --hotfix --approvers 2
    ```
````

## Tight and loose

A definition holding one paragraph renders its text straight inside `<dd>`. With more blocks, each paragraph keeps its `<p>`. With Comark's `autoUnwrap: false`, a loose list, one with a blank line inside a definition, keeps `<p>` in every definition, as markdown-it-deflist does.

## What isn't a definition

A colon with no space after it, such as `:3 to 1` or a `:component`, stays text, and so does a `: line` with no term above it.

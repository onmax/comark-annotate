---
title: comark-deflist
description: Definition lists in Markdown, rendered as native dl, dt, and dd.
tagline: Write a term, then its definition on a line that starts with a colon, and get a glossary with no component and no styles.
install: pnpm add comark comark-deflist
group: Markdown syntax
icon: book-a
blurb: Terms and their definitions
credits: 'Ported from <a href="https://github.com/markdown-it/markdown-it-deflist">markdown-it-deflist</a>, after <a href="https://pandoc.org/MANUAL.html#definition-lists">Pandoc</a>''s and PHP Markdown Extra''s syntax.'
---

::examples
:::example{label="Glossary"}
```md
Flaky test
: A test that passes and fails on the same code.

Rubber duck
: A listener who doesn't need to understand the bug.
: A bath toy.
```
:::

:::example{label="Long definitions"}
```md
Pigeon count
:   The number of pigeons on the office roof at 9:00.

    Above 12, the deploy waits. Below 12, it ships.

    - Count once, from the window.
    - Pigeons that fly off mid-count still count.

Pizza vote
:   Fridays at noon. Pineapple needs two thirds.
```
:::
::

A term sits on one line and each definition starts with `:` or `~` and a space. Indented lines continue a definition, so it can hold paragraphs, lists, and code. The list renders as plain `<dl>`, `<dt>`, and `<dd>`, which your page's styles already cover.

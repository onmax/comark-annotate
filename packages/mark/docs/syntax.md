---
title: Syntax
description: Highlights, superscripts, and why there is no subscript.
---

## Highlight

Two equals signs on each side highlight text. Markdown works inside, and `{attributes}` work after the closing pair:

```md
The ==deploy freeze== starts at noon.

==Pineapple needs **two thirds**==.

==Do not deploy=={.warning}
```

A single `=`, as in `a = b`, stays text, and so does a `==` with nothing to close it.

## Superscript

Carets on each side make a superscript, with no spaces inside. Escape a space with a backslash:

```md
10^3^ pigeons, the 1^st^ count, and E = mc^2^.

A ^spaced\ superscript^.
```

`^` right after `[`, as in a footnote reference `[^1]`, never starts a superscript, so the plugin works beside any footnotes plugin.

## No subscript

`~sub~` is left out on purpose. Comark's autoClose escapes a lone `~` before any plugin sees the Markdown ([comarkdown/comark#462](https://github.com/comarkdown/comark/issues/462)), and GitHub reads `~text~` as strikethrough, so the same file would mean two things. Write `<sub>2</sub>` for a subscript, as in H<sub>2</sub>O.

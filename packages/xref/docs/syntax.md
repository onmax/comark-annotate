---
title: Syntax
description: Labels, references, and what each becomes.
---

## Figures

```md
![The login page](login.png){#fig-login}
```

An image alone in its paragraph with an id that starts with `fig-` becomes a `figure`, captioned "Figure 1: The login page" from its alt text. A `::figure{#fig-...}` block of your own is numbered as it is, and so is any other element with a `fig-` id, such as a comark-annotate `::screenshot`.

## Tables

```md
::table{#tbl-times caption="Homing times by bird"}
| Bird | Time |
| --- | --- |
| Rosa | 1 h 52 min |
::
```

A Markdown table can't take an id on its own, so wrap it in `::table` with an id that starts with `tbl-`. Its `caption` follows the number, "Table 1: Homing times by bird".

## References

```md
As :ref{#fig-login} shows, the button moved.
```

`:ref{#id}` becomes a link to the label that reads "Figure 1" or "Table 1". It can point at a label above or below it.

Pandoc's `@fig-login` isn't read, since `@name` is a mention in comark-chips and comark-github.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a reference with no id, one to a label that doesn't exist (it renders as `[id]`), a label used twice, and a labeled image that shares its paragraph with text, so it isn't a figure, and text inside a `:ref`, which it drops. Each issue names its block and says how to fix it, and each has its own rule in [Doctor](/doctor/).

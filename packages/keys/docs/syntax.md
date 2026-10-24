---
title: Syntax
description: Key names, aliases, quoted keys, and what stays text.
---

A shortcut is keys between `++` and `++`, joined by single `+` signs, with no spaces:

```md
++ctrl+alt+del++
```

It renders as:

```html
<span class="ckb"><kbd class="ckb-control">Ctrl</kbd><span>+</span><kbd class="ckb-alt">Alt</kbd><span>+</span><kbd class="ckb-delete">Del</kbd></span>
```

Each named key gets a `ckb-` class with its full name, whichever alias you wrote, so `ctrl` and `control` both give `ckb-control`.

## Names

Names aren't case sensitive. Letters and digits render uppercase, `f1` to `f24` as F1 to F24, and these as their usual labels:

| Keys | Write |
| --- | --- |
| Modifiers | `ctrl`, `alt`, `shift`, `cmd`, `opt`, `option`, `meta`, `super`, `win`, `fn`, `altgr` |
| Editing | `enter`, `return`, `tab`, `esc`, `space`, `backspace`, `bksp`, `del`, `ins`, `caps-lock` |
| Moving | `up`, `down`, `left`, `right`, `home`, `end`, `pg-up`, `pg-dn`, `page-up`, `page-down` |
| Others | `print-screen`, `prtsc`, `menu` |
| Punctuation | `plus`, `minus`, `equal`, `comma`, `period`, `slash`, `backslash`, `semicolon`, `colon`, `grave`, `tilde`, `bracket-left`, `bracket-right`, `brace-left`, `brace-right`, `less`, `greater`, `question`, `exclam`, `bar`, `underscore`, `single-quote`, `double-quote` |

The names and aliases are pymdownx.keys'. Its numpad, media, browser, mouse, and left and right modifier keys are left out; add the ones you need with the `keys` option.

## Quoted keys

Quote a key to show any text, in single or double quotes, with a backslash before a quote inside:

```md
++ctrl+"Fire \"all\""++ ++'Any Key'++
```

A quoted key gets no class.

## What stays text

As in pymdownx.keys, one unknown name leaves the whole shortcut as text, so `++ctrl+nope++` shows as written; quote the key to show it anyway. Text stays text when it has spaces inside, as in `a++ b++`, or when the `++` follows a letter, digit, or `+`, as in `C++`. So does `{++`, which opens an insertion in comark-critic. Code spans and `\+\+` stay as written too.

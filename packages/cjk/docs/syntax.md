---
title: Syntax
description: What the plugin changes in CommonMark's emphasis rule, and what it leaves alone.
---

The syntax is CommonMark's: `**bold**`, `*italics*`, and `~~strikethrough~~`. Only the rule for where they start and end changes.

## The rule it fixes

CommonMark lets `**` close bold only when it is right-flanking. Roughly, that means it comes after text and not before more of it, unless punctuation sits on its left and a space or punctuation on its right. `**太字。**次` breaks that: `。` is punctuation and `次` is a letter, so the closing `**` is left as text and the whole line shows its asterisks.

English puts a space after a full stop, so it never hits this. Chinese, Japanese, and Korean put no space after `。`, `、`, `」`, or `.`. With the plugin, a delimiter next to a character from those scripts may open or close as if a space were there:

```md
**この文は太字。**次の文
*「強調」*です
~~削除。~~次
**이 문장은 굵게.**다음 문장
```

## What stays the same

Text with no Chinese, Japanese, or Korean on either side of a delimiter parses as CommonMark says, so `**foo.**bar` still shows its asterisks. `_` and `__` still don't open or close in the middle of a word, so write `**` and `*` in these languages.

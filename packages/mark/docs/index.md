---
title: comark-mark
description: Highlighted text and superscripts in Markdown, rendered as native mark and sup.
keywords: highlighter, marker, ==text==, x^2^, sup
tagline: Write ==this== to highlight it and x^2^ for a superscript, with no component and no styles.
install: pnpm add comark comark-mark
group: Markdown syntax
icon: highlighter
blurb: Highlights and superscripts
credits: 'Ported from <a href="https://github.com/markdown-it/markdown-it-mark">markdown-it-mark</a> and <a href="https://github.com/markdown-it/markdown-it-sup">markdown-it-sup</a>.'
---

::examples
:::example{label="Highlight"}
```md
The deploy waits while ==more than 12 pigeons== sit on the roof.

Pineapple pizza needs ==two thirds of the **Friday** vote==.
```
:::

:::example{label="Superscript"}
```md
The office roof holds about 10^3^ pigeons, and the 1^st^ count of the day is at 9:00.
```
:::
::

`==text==` renders as `<mark>` and `^text^` as `<sup>`, both native HTML that your page's styles already cover. Markdown works inside a highlight, and `{attributes}` work after one.

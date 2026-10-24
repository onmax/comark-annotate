---
title: comark-footnotes
description: Footnotes in Markdown, with notes that hold any Markdown, in place of Comark's own plugin.
tagline: 'Write [^1] where a note applies and [^1]: anywhere below, or the note itself as ^[text], and get numbered notes at the end of the page.'
install: pnpm add comark comark-footnotes
group: Markdown syntax
icon: footprints
blurb: Numbered notes at the end of the page
credits: 'Syntax and parser from <a href="https://github.com/markdown-it/markdown-it-footnote">markdown-it-footnote</a>, and the nodes from Comark''s own footnotes plugin.'
---

::examples
:::example{label="References"}
```md
The deploy waits when the roof holds more than 12 pigeons[^count], unless it's a hotfix[^hotfix].

[^count]: Counted once, from the window, at 9:00.
[^hotfix]: A hotfix needs **two** approvals.
```
:::

:::example{label="Long notes"}
```md
Pizza is ordered on Fridays[^pizza].

[^pizza]: Pineapple needs a vote,
    and the vote needs two thirds.

    The order goes in at noon:

    - one margherita per four people
    - one diavola for the table
```
:::

:::example{label="Inline notes"}
```md
The retro moved to Thursday^[Friday is pizza day.], and the rubber duck^[A yellow one, on the second desk.] runs it.
```
:::
::

Notes are numbered in the order the text first references them and listed in a section at the end. A definition can run over indented lines and hold paragraphs, lists, and code. The nodes are the ones `comark/plugins/footnotes` writes, so styles and renderers made for it keep working.

---
title: comark-xref
description: Numbered figures and tables, and references to them, written in Markdown.
tagline: Label an image or a table with an id and it gets a number. Write a reference to it and the reference reads "Figure 2", and stays right when figures move.
install: pnpm add comark comark-xref
group: Authoring tools
icon: hash
blurb: Numbered figures and references
credits: 'Labels after <a href="https://quarto.org/docs/authoring/cross-references.html">Quarto</a>''s cross-references.'
---

::examples
:::example{label="Figures"}
```md
The pigeon tracker before the redesign is in :ref{#fig-before}, and after it in :ref{#fig-after}.

![The tracker before the redesign](/before.png){#fig-before}

![The tracker after the redesign](/after.png){#fig-after}
```
:::

:::example{label="Tables"}
```md
:ref{#tbl-times} has the homing times, and :ref{#fig-route} the dashboard they come from.

::table{#tbl-times caption="Homing times by bird"}
| Bird | Distance | Time |
| --- | --- | --- |
| Rosa | 120 km | 1 h 52 min |
| Bruno | 120 km | 2 h 10 min |
::

![The race dashboard](/dashboard.png){#fig-route}
```
:::
::

Figures and tables are numbered separately, in the order they appear, and a reference can come before what it points at. A reference to a label that doesn't exist is an issue, not a broken link.

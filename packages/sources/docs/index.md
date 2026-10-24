---
title: comark-sources
description: Numbered citations and the list of sources they point at, written in Markdown.
tagline: Cite a source inline with a number, list the sources at the end, and each citation links to its source and back.
install: pnpm add comark @comark/html comark-sources
group: Review blocks
icon: quote
blurb: Citations and a list of sources
credits: 'After <a href="https://ai-sdk.dev/elements">AI Elements</a>'' Sources and Inline Citation.'
---

::examples
:::example{label="Citations"}
```md
Pigeons find home by the sun and by the earth's magnetic field :cite[1], and some by smell too :cite[2,3].

::sources
1. [Magnetoreception in homing pigeons](https://en.wikipedia.org/wiki/Magnetoreception)
2. [Olfactory navigation](https://en.wikipedia.org/wiki/Pigeon_intelligence)
3. [How do homing pigeons navigate?](https://www.sciencefocus.com/nature/how-do-homing-pigeons-navigate)
::
```
:::
::

Each source links back to every place it's cited, and each citation shows its source's title on hover. A citation of a source the list doesn't have is an issue, not a dead link, which matters when an agent writes the document and the numbers drift.

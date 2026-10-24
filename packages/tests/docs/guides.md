---
title: Guides
description: Results in a pull request, and why there's no XML library.
---

## Results in a pull request

Have CI write the report next to the review document, then point the block at it:

```md
::tests{src="./reports/junit.xml" title="CI run"}
::
```

The summary is one line, and the failures stay closed until a reader opens one, so a long report doesn't push the rest of the review down. In print, every failure prints open.

## The XML parser

JUnit XML uses a small part of XML: elements, attributes, text, CDATA, and the five entities. The plugin reads it with a parser of its own, about a hundred lines with no dependency, rather than pulling in a general XML library many times its size. It refuses what isn't well-formed and says on which line, and it skips doctypes without reading them, so a report can't make it load anything.

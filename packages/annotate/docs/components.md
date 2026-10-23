---
title: Components
description: screenshot, annotation, and compare, one page each.
---

Three blocks, each on its own page:

- [`screenshot`](/annotate/components/screenshot/) is an image with marks on it.
- [`annotation`](/annotate/components/annotation/) is one mark and its note, inside a screenshot.
- [`compare`](/annotate/components/compare/) shows two screenshots side by side, or one over the other with a slider.

An `annotation` goes inside a `screenshot`, and a `compare` holds two screenshots:

```md
::compare
:::screenshot{src="/before.png" alt="Toolbar wrapping"}
::::annotation{x=22.4 y=50.4 w=13.3 h=20.6 color="red"}
**Apply** sits lower than the chips.
::::
:::

:::screenshot{src="/after.png" alt="Toolbar on one row"}
:::
::
```

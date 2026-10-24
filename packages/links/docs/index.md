---
title: comark-links
description: External links with the target and rel you choose, and a link beside each heading.
tagline: Say which links open a new tab and warn before they do, and give every section a link to itself.
install: pnpm add comark @comark/html comark-links
group: Page behavior
icon: link
blurb: External links and heading anchors
credits: 'The heading markup is <a href="https://github.com/withastro/starlight/pull/3033">Starlight''s</a>, the defaults follow <a href="https://github.com/rehypejs/rehype-external-links">rehype-external-links</a>, and the new-tab warning is WCAG''s <a href="https://www.w3.org/WAI/WCAG22/Techniques/general/G201">G201</a>.'
---

::examples
:::example{label="Heading links"}
```md
## Rollout plan

Point at the step people ask about, not the top of the page.

### Week one

Internal teams only.
```
:::

:::example{label="New tab"}
```md
Read [the incident report](https://example.com/incidents/42){target="_blank"} before the review, then come back to [the checklist](/links/guides/).
```
:::
::

Two plugins, each one on its own:

- `anchors()` puts a `#` after each h2, h3, and h4, linking to the heading itself, so readers can share a section. It shows when the pointer is on the heading, or always on a touch screen. The link sits beside the heading, not inside it, so screen readers don't read "#" as part of the heading's name.
- `external()` writes `target` and `rel` on links to other sites while parsing. It opens nothing in a new tab unless you ask, and when a link does open one, it adds ↗ and "(opens in a new tab)" for screen readers, so nobody is surprised by a new tab.

Comark gives headings ids but draws no link to them, and changes a link's target only when you write `{target="_blank"}` on it.

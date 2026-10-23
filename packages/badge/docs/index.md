---
title: comark-badge
description: Badges for versions and statuses, written in Markdown.
tagline: Mark an API deprecated, a feature new, or a release by its version, in one of Nuxt UI's seven colors.
install: pnpm add comark @comark/html comark-badge
group: Docs blocks
icon: tag
blurb: Badges
credits: 'Syntax and colors from <a href="https://ui.nuxt.com/docs/typography">Nuxt UI</a>''s prose badge.'
---

::examples
:::example{label="Inline"}
```md
## useAsyncData :badge[deprecated]{color="warning"}

Use `useFetch` instead. :badge[v4]{color="info"} :badge[stable]{color="success"}
```
:::

:::example{label="Block"}
```md
::badge
**v4.0.0**
::
```
:::
::

A badge is a `<span>` in a tint of its color with text in the color, so it reads on light and dark pages. On a Nuxt UI page, it takes the app's `--ui-primary` and the other color variables.

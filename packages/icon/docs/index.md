---
title: comark-icon
description: Iconify icons in Markdown, drawn as CSS in every renderer.
tagline: Write :icon{name="lucide:apple"} with any of Iconify's 200,000 icons, and get it on the page with no script.
install: pnpm add comark @comark/html comark-icon
group: Review blocks
icon: shapes
blurb: Iconify icons in Markdown
---

::examples
:::example{label="Inline"}
```md
Press :icon{name="lucide:command"} K to search, or :icon{name="lucide:star"} a page to keep it.
```
:::

:::example{label="Logos"}
```md
Built with :icon{name="logos:vue" label="Vue"} and :icon{name="logos:vitejs" label="Vite"}, deployed to :icon{name="logos:cloudflare-icon" label="Cloudflare"}.
```
:::

:::example{label="Nuxt UI names"}
```md
:icon{name="i-simple-icons-github"} Star the repository.
```
:::
::

An icon in one color takes the color of the text around it and follows its theme; one with colors of its own, such as a logo, keeps them. Icons are resolved while parsing and written into the page as CSS images, so the page asks no server for them and they show without a script.

The resolver is public, so other plugins take the same options and draw their icons with it. [comark-tabs](/tabs/guides/#icons) uses it for tab icons.

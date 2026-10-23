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
Merge the :icon{name="lucide:git-pull-request"} pull request once its :icon{name="lucide:circle-check"} checks pass.
```
:::

:::example{label="Logos"}
```md
Built with :icon{name="logos:vue"} Vue and :icon{name="logos:vitejs"} Vite, deployed to :icon{name="logos:cloudflare-icon"} Cloudflare.
```
:::

:::example{label="Nuxt UI spelling"}
```md
:icon{name="simple-icons:github"} and :icon{name="i-simple-icons-github"}, as Nuxt UI writes it, draw the same icon.
```
:::
::

An icon in one color takes the color of the text around it and follows its theme. One with colors of its own, such as a logo, keeps them.

The plugin resolves icons while parsing and writes them into the page as CSS images. The page asks no server for them, and they show without a script.

The resolver is public, so other plugins take the same options and draw their icons with it. [comark-tabs](/tabs/guides/#icons) uses it for tab icons.

---
title: comark-chips
description: Links and @mentions as chips with the site's favicon or the person's avatar, written in Markdown.
tagline: Write a link or an @user as usual and get a chip with its favicon or avatar, downloaded while parsing so readers ask no one.
install: pnpm add comark @comark/html comark-chips
group: Review blocks
icon: at-sign
blurb: Links and @mentions as chips
credits: 'After <a href="https://antfu.me">Anthony Fu</a>''s <a href="https://github.com/antfu/markdown-it-magic-link">markdown-it-magic-link</a>. Favicons from Google, avatars from GitHub.'
---

::examples
:::example{label="Links"}
```md
Built with [Vite](https://vite.dev), [Vue](https://vuejs.org), and [Nuxt](https://nuxt.com).
```
:::

:::example{label="Mentions"}
```md
@posva maintains [Vue Router](https://github.com/vuejs/router), and @danielroe leads [Nuxt](https://github.com/nuxt/nuxt).
```
:::

:::example{label="Overrides"}
```md
Ask [Anthony](https://antfu.me){avatar="@antfu"}, or read the [guide](https://vite.dev/guide/){chip=false}. The pages render with :chip[Comark]{href="https://comark.dev"}.
```
:::
::

Every web link becomes a chip with its site's favicon, and every `@user` a chip with their GitHub avatar that links to their profile. A link into a GitHub account or repository shows the account's avatar.

The images are downloaded while parsing and inlined, so the page asks no other site for them. One that can't be downloaded, such as in a browser that blocks the request, stays a link for the reader's browser to load.

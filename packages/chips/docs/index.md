---
title: comark-chips
description: Links and @mentions as chips with the site's favicon or the person's avatar, written in Markdown.
keywords: mention, avatar, favicon, link preview, user, GitHub user, pill, inline link, unavatar
tagline: Write a link or an @user as usual and get a chip with its favicon or avatar, downloaded while parsing so readers ask no one.
install: pnpm add comark @comark/html comark-chips
group: Review blocks
icon: at-sign
blurb: Links and @mentions as chips
credits: 'After <a href="https://antfu.me">Anthony Fu</a>''s <a href="https://github.com/antfu/markdown-it-magic-link">markdown-it-magic-link</a>. Favicons from Google, avatars from GitHub and <a href="https://unavatar.io">unavatar.io</a>.'
---

::examples
:::example{label="Links"}
```md
Moves the build from [webpack](https://webpack.js.org) to [Vite](https://vite.dev), as the [Nuxt docs](https://nuxt.com/docs) recommend.
```
:::

:::example{label="Mentions"}
```md
@posva maintains [Vue Router](https://github.com/vuejs/router), and @danielroe leads [Nuxt](https://github.com/nuxt/nuxt). [Evan](https://bsky.app/profile/evanyou.me) posts on Bluesky.
```
:::

:::example{label="Overrides"}
```md
Ask [Anthony](https://antfu.me){avatar="@antfu"}, or read the [guide](https://vite.dev/guide/){chip=false}. The pages render with :chip[Comark]{href="https://comark.dev"}.
```
:::
::

Every web link becomes a chip with its site's favicon, and every `@user` a chip with their GitHub avatar that links to their profile. A link into a GitHub account or repository shows the account's avatar, and a link into an X, Bluesky, YouTube, or GitLab account shows theirs through [unavatar.io](https://unavatar.io).

The plugin downloads the images while parsing and inlines them, so the page asks no other site for them. It keeps them on disk, so the next build asks no one either. An image it can't download, such as in a browser that blocks the request, stays a link for the reader's browser to load.

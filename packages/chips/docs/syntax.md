---
title: Syntax
description: Which links and mentions become chips, and the props that change one.
---

## Links

Any link to an `http` or `https` address becomes a chip. A link's text stays as written, except that a bare URL loses its scheme and an `@user` link its `@`. These stay plain links:

- relative links, anchors, and `mailto:` links;
- a link around an image, such as a badge;
- a link written as raw HTML;
- a link with `{chip=false}`.

## Mentions

`@user` becomes a chip linking to `https://github.com/user`. It must stand on its own: `me@example.com` and `@comark/html` stay text. So does anything in a link or in code.

## Props

| Prop | On | Does |
| --- | --- | --- |
| `avatar="https://…"` | a link or `:chip` | Uses this image, round like an avatar |
| `avatar="@user"` | a link or `:chip` | Uses that GitHub account's avatar |
| `chip=false` | a link | Keeps a plain link |
| `href` | `:chip` | The address, required |
| `title` | a link or `:chip` | The tooltip, as on any link |

`:chip[Text]{href="https://…"}` writes a chip directly, for text that isn't a link elsewhere in Markdown.

[Theming](/chips/theming/) covers the variables and class names that change how chips look.

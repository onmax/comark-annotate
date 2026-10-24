---
title: Guides
description: When to open a new tab, and styling the links.
---

## New tabs

Leave `target` off unless you have a reason. A reader who wants a new tab can open one, and one who doesn't can't stop a link from opening it. rehype-external-links stopped adding `target="_blank"` by default in its version 2 for this reason.

Some pages have a reason, such as a form the reader would lose by leaving, or a playground with unsaved work. Open external links in a new tab there, and list your own hosts so links to the rest of your site stay in the tab:

```ts
external({ target: "_blank", hosts: ["example.com", "docs.example.com"] });
```

Every link that opens a new tab gets ↗ and "(opens in a new tab)", which screen readers read after the link's text. That is WCAG's [technique G201](https://www.w3.org/WAI/WCAG22/Techniques/general/G201): say a link opens a new window before the reader follows it. For a site in another language, change the words:

```ts
external({ target: "_blank", label: "(se abre en una pestaña nueva)" });
```

To mark links for search engines without changing where they open, set only `rel`:

```ts
external({ rel: ["nofollow", "ugc"] });
```

## Which links are external

By default a link is external when its `href` starts with `http://`, `https://`, or `//` and its host isn't in `hosts`. Pass `test` to decide yourself, from the `href`:

```ts
// Everything outside /docs, including your own blog.
external({ target: "_blank", test: (href) => /^https?:/.test(href) && !href.startsWith("https://example.com/docs") });
```

`test` replaces the default, so `hosts` no longer counts once you pass it.

## Styling

The rules sit in the `comark` CSS layer, so any plain rule of yours wins. The classes are `.cl-heading` around a heading and its link, `.cl-anchor` on the link, `.cl-icon` on the arrow, and `.cl-sr` on the text only screen readers hear. The heading links read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-muted` | The `#` link |
| `--comark-foreground` | The `#` link under the pointer |
| `--comark-ring` | The focus ring on the link |
| `--comark-radius` | The focus ring's corners |

`.cl-heading` is a flex row, so the heading keeps its own font and margins, and the link sits on its first line. Two things change for a heading inside it:

- Its margins no longer merge with the paragraph's above it, so the gap can grow. Set the margins on `.cl-heading` and zero them on the heading if that matters.
- Its border or background ends at the end of its text. Move them to `.cl-heading:has(> h2)`.

To always show the links, even with a mouse:

```css
.cl-anchor {
  opacity: 1;
}
```

---
title: Renderers
description: Which renderer each package supports, and how to use several in one document.
tagline: Register every plugin you use in one renderer. The same markup comes out of HTML, Vue, React, and Svelte, and each package's docs page lists the props.
---

## Support

| Package | `@comark/html` | `@comark/vue` | `@comark/react` | `@comark/svelte` |
| --- | --- | --- | --- | --- |
| [annotate](/annotate/) | `comark-annotate/html` | | | |
| [carousel](/carousel/) | `comark-carousel/html` | `comark-carousel/vue` | `comark-carousel/react` | `comark-carousel/svelte` |
| [charts](/charts/) | `comark-charts/html` | `comark-charts/vue` | `comark-charts/react` | `comark-charts/svelte` |
| [code](/code/) | `comark-code/html` | `comark-code/vue` | `comark-code/react` | `comark-code/svelte` |
| [embed](/embed/) | `comark-embed/html` | `comark-embed/vue` | `comark-embed/react` | `comark-embed/svelte` |
| [github](/github/) | `comark-github/html` | `comark-github/vue` | `comark-github/react` | `comark-github/svelte` |
| [tabs](/tabs/) | `comark-tabs/html` | `comark-tabs/vue` | `comark-tabs/react` | `comark-tabs/svelte` |
| [zoom](/zoom/) | `comark-zoom/html` | `comark-zoom/vue` | `comark-zoom/react` | `comark-zoom/svelte` |

Each entry exports the parse plugin as `default` and the renderer's `components`. Annotate renders only to HTML: a screenshot's notes are Markdown, and a Vue, React, or Svelte version would each copy the whole figure. So marks on a chart, which annotate draws, show only in `@comark/html`; the other renderers draw the chart without them. [include](/include/) has no components, since what it pastes renders like the rest of the page, so it works with any renderer. [lint](/lint/) checks documents and doesn't render them.

## Several plugins

Pass all the plugins to one renderer, and spread their `components` into one map:

```ts
import { createHtmlRenderer } from "@comark/html";
import include from "comark-include";
import annotate, { components as annotateComponents } from "comark-annotate/html";
import carousel, { components as carouselComponents } from "comark-carousel/html";
import embed, { components as embedComponents } from "comark-embed/html";
import { callouts, components as githubComponents } from "comark-github/html";
import zoom, { components as zoomComponents } from "comark-zoom/html";

const render = createHtmlRenderer({
  plugins: [include(), annotate(), carousel(), embed(), callouts(), zoom()],
  components: {
    ...annotateComponents,
    ...carouselComponents,
    ...embedComponents,
    ...githubComponents,
    ...zoomComponents,
  },
});
```

Put `include` first: it pastes files into the Markdown before the others read it. `callouts()` is named `alert`, so it takes the place of Comark's built-in alert plugin wherever you list it. Annotate brings zoom and carousel with it, so screenshots and comparisons zoom without `zoom()`; add `zoom()` when content images and `::zoom` blocks should zoom too.

## Scripts and styles

Nothing needs a script to read. Zoom, carousel, tabs, code, and annotate add behavior on top: zooming, arrows and keys, switching tabs, copying and wrapping code, hover and copy. Callouts and embeds need only styles.

The HTML renderers inline each plugin's styles, and its script if it has one, once per document. The Vue, React, and Svelte components start the script when they mount and stop it when the last one unmounts, and add the styles the same way. Import each package's `style.css`, such as `comark-zoom/style.css`, with your styles when you render on a server, so the page doesn't shift when the components mount.

Without a renderer, call `start()` from `comark-zoom/client` once on a page with `data-zoom` elements. It adds the styles and returns a function that stops it.

## Content Security Policy

The inlined `<style>` and `<script>` elements need `'unsafe-inline'` in `style-src` and `script-src`, or a hash of each. A script's text changes only between versions. Annotate also places marks with `style` attributes, so its pages need `style-src 'unsafe-inline'`.

Notes, slides, and callouts are ordinary Markdown, so raw HTML in them renders like anywhere else in the document. For untrusted input, add Comark's `security` plugin and list the tags to drop, such as `security({ blockedTags: ["script", "style", "iframe"] })`.

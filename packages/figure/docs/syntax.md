---
title: Syntax
description: Which images become figures, and where.
---

The caption is the image's title, the quoted text after its URL:

```md
![A rubber duck on a keyboard](/duck.png "The duck that found the race condition")
```

The image keeps its `src`, its alt text, and any `{attributes}`, and loses only the `title`, since the caption now says it:

```html
<figure>
  <img src="/duck.png" alt="A rubber duck on a keyboard">
  <figcaption>The duck that found the race condition</figcaption>
</figure>
```

## What becomes a figure

An image with a title that stands alone in its paragraph, at the top of the page, in a list item, in a blockquote, in a definition, or in a `::component` next to other blocks. An image inside a sentence keeps its title as a tooltip.

A linked image counts too: `[![alt](src "Caption")](https://example.com)` keeps the link around the image, and the caption sits under it, outside the link.

The caption is plain text, as a title is. A title on the link instead of the image, `[![alt](src)](url "Title")`, stays the link's tooltip.

## Inside a component

When a `::component` holds nothing but the image, Comark removes the paragraph, and the image ends up as the component's only child. An inline `:component[![alt](src "Title")]` alone on its line produces the same tree, so the plugin leaves both as they are. Add another block to the component, and its image becomes a figure.

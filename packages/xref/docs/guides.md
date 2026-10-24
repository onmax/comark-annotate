---
title: Guides
description: Long review documents, and styling captions and references.
---

## Long review documents

A review with several screenshots reads better when the text says which one it means. Label each screenshot and refer to it by label, and the numbers stay right when you add, remove, or reorder them:

```md
The empty state in :ref{#fig-empty} replaces the spinner in :ref{#fig-loading}.

![The new empty state](empty.png){#fig-empty}

![The old spinner](loading.png){#fig-loading}
```

## Styling

The plugin ships no styles, since figures, captions, and links already have the page's. These classes are there for your own rules:

| Class | Element |
| --- | --- |
| `.cxr` | A `figure` it made from an image, and a labeled table |
| `.cxr-label` | The "Figure 1:" or "Table 1:" at the start of a caption |
| `.cxr-ref` | A reference |

```css
.cxr-label {
  font-weight: 600;
}
```

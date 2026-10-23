---
title: Guides
description: Styling figures, and writing alt text and captions that don't repeat each other.
---

## Styling

The plugin adds no classes and no styles. Browsers indent a figure by 40px on each side. To set it flush with the text and the caption small and muted:

```css
figure {
  margin: 1.5em 0;
}
figcaption {
  margin-top: 0.5em;
  font-size: 0.875em;
  color: #6b7280;
}
```

## Alt text and captions

Screen readers read both, so they shouldn't say the same thing. Alt text says what the image shows, for someone who can't see it. The caption says why it's there, for everyone:

```md
![Bar chart: deploys per day, highest on Tuesday](/deploys.png "Most deploys land on Tuesday, after the Monday freeze")
```

## Images without captions

With `unwrap: true`, an image alone in its paragraph renders as a bare `<img>` with no `<p>` around it, so a stylesheet can size block images apart from the ones inside a sentence with `.prose > img`.

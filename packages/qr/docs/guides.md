---
title: Guides
description: Preview links in review documents, and sizing.
---

## Preview links in review documents

A review of a visual change often comes with a preview deployment. Put its link and a code side by side, so a reviewer at a desk clicks and one with a phone scans:

```md
| Preview | Phone |
| --- | --- |
| [pr-123.preview.example.com](https://pr-123.preview.example.com) | :qr{value="https://pr-123.preview.example.com"} |
```

## Sizing

Codes are 8rem wide by default. Set `--cqr-size` on `.cqr` or any element above it:

```css
.cqr {
  --cqr-size: 6rem;
}
```

The code is always black on white, since phones read dark modules on a light ground best. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cqr` | The `span` around the code's `svg` |

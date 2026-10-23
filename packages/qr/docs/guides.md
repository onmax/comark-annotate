---
title: Guides
description: Preview links in review documents, sizing, and theming.
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

## Theming

The code sits on a tile that reads the [shared tokens](/guide/theming/): `--comark-border` for its 1px border and `--comark-radius` for its corners, capped at `0.5rem` so they can't round into the code. The modules are always black on white, in both color schemes, since phones read dark modules on a light ground best. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cqr` | The `span` around the code's `svg` |

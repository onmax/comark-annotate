---
title: Syntax
description: The props of :qr.
---

```md
:qr{value="https://pr-123.preview.example.com"}
```

| Prop | What it does |
| --- | --- |
| `value` | Required. The text to encode, usually a link. Up to about 2,300 characters. |

`:qr` is inline, so it can sit in a sentence, a table cell, or a list item. It's an `svg` in a `span` named "QR code: " and its value for screen readers. The code uses error correction level M and a quiet zone of two modules.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a `:qr` with no `value`, and one too long to encode. Each issue names its block and says how to fix it, and the `:qr` renders nothing.

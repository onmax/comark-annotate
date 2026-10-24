---
title: comark-qr
description: QR codes drawn while parsing, written in Markdown.
keywords: QR code, qrcode, barcode, phone, mobile preview, scan
tagline: Put a QR code next to a preview link so a reviewer can open it on their phone. It's an SVG drawn while parsing, with no script and no image to fetch.
install: pnpm add comark @comark/html comark-qr
group: Review blocks
icon: qr-code
blurb: QR codes for preview links
credits: 'Encoded with <a href="https://antfu.me">Anthony Fu</a>''s <a href="https://github.com/unjs/uqr">uqr</a>, at the defaults of his <a href="https://qrcode.antfu.me">QR Toolkit</a>.'
---

::examples
:::example{label="Preview link"}
```md
Open the preview on your phone: :qr{value="https://comark-ui.onmax.me/qr/"}
```
:::
::

The code is an inline SVG with one path, dark on white in both color schemes, so a phone's camera reads it off any page, and it prints.

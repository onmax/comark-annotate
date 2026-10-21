---
title: Syntax
description: The five callout types, their titles, and how to theme them.
---

```md
> [!TYPE] Optional title
> The body: any Markdown, over as many lines as it needs.
```

| Type | Use it for |
| --- | --- |
| `NOTE` | Context the reader should know, even when skimming |
| `TIP` | A better or faster way to do something |
| `IMPORTANT` | Something the reader needs to succeed |
| `WARNING` | A risk that needs their attention now |
| `CAUTION` | An action with consequences they can't undo |

The marker is case-insensitive. Callouts work inside lists and other blocks.

## Theming

Callouts follow shadcn/ui's Alert and the shared tokens in [Theming](/guide/theming/), and read shadcn's `--destructive` for `CAUTION`. Set `--cgc-note`, `--cgc-tip`, `--cgc-important`, `--cgc-warning`, or `--cgc-caution` to recolor one type:

```css
.cgc {
  --cgc-note: oklch(0.55 0.2 260);
}
```

A callout is a `.cgc` with `data-type`, holding `.cgc-icon`, `.cgc-title`, and `.cgc-body`.

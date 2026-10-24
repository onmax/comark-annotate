---
title: Guides
description: Styling keys, and keys with other plugins.
---

## Styling

The plugin adds no styles, and browsers show `<kbd>` in a monospace font. To draw keycaps:

```css
.ckb kbd {
  padding: 0.1em 0.4em;
  border: 1px solid color-mix(in oklab, currentColor 25%, transparent);
  border-bottom-width: 2px;
  border-radius: 0.3em;
  font-size: 0.85em;
}
.ckb > span {
  padding: 0 0.2em;
}
```

The `ckb-` class on each key picks one out, for example to draw `.ckb-command` as ⌘.

## With other plugins

The plugin reads `++` before emphasis, so `**++esc++**` is a bold key. comark-critic's `{++insertion++}` starts with a `{`, which keys never follow, so the two plugins work together in any order.

Attributes after a shortcut, `++esc++{.danger}`, go on its `.ckb` span. A class there replaces `ckb` instead of joining it, because Comark assigns the attributes over the span's own.

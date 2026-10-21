---
title: Guides
description: Actions of your own, Copy, and Wrap.
---

## Actions

Add buttons of your own with `actions`. Each one goes on the code blocks in its `languages`, or on every block when you leave them out, before Wrap and Copy:

```ts
const render = createHtmlRenderer({
  plugins: [code({ actions: [{ id: "run", label: "Run", languages: ["sh", "bash"] }] })],
  components,
});
```

A click sends a `comark-code-action` event from the block, which bubbles up to the page. Its `detail` holds the action's `id`, the block's code, and its language, and your app decides what the action does:

```ts
document.addEventListener("comark-code-action", (event) => {
  const { action, code, language } = event.detail;
  if (action === "run") terminal.run(code);
});
```

The plugin does nothing else, so `code()` with no actions only adds Copy and Wrap, which come from the components. To see an action's button, add one under `comark-code` in the [playground](/play/)'s Config tab.

## Copy

Copy takes the code's text as written, without the highlighting. A check confirms it, and a status line tells screen readers. When the page can't write to the clipboard, such as over plain http, it selects the code instead and says to press Ctrl+C or ⌘C.

## Wrap

Wrap breaks long lines in its own block and stays on until it's pressed again, and it isn't saved for the next visit.

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

A button shows a `label`, an `icon`, or both. The icon is an Iconify name, such as `lucide:play`, or an image URL. It resolves while parsing, like comark-icon's icons, and `iconResolver` shares comark-icon's `collections`. An icon-only button needs a `title`, which is its tooltip and the name screen readers read:

```ts
code({
  actions: [
    { id: "run", label: "Run", icon: "lucide:play", languages: ["sh", "bash"] },
    { id: "explain", icon: "lucide:sparkles", title: "Explain this code" },
  ],
});
```

If an icon can't be drawn, the plugin reports it in `meta.issues` under the same [Doctor](/doctor/) rule as an `:icon`'s, and the button shows its title as text instead.

Your app decides what an action does. `onCodeAction()` from `comark-code/client` calls your function with the block's code and language whenever that action's button is clicked, and returns a function that stops it:

```ts
import { onCodeAction } from "comark-code/client";

const stop = onCodeAction("run", ({ code, language }) => terminal.run(code));
```

The callback lives in the page, not in the plugin's options, because the HTML may be rendered on a server where your function can't follow it.

Under the hood, a click sends a `comark-code-action` event from the block. It bubbles up to the page with the action's `id`, the code, and the language in its `detail`. Listen for it yourself to handle every action in one place.

The plugin does nothing else, so `code()` with no actions only adds Copy and Wrap, which come from the components. To see an action's button, add one under `comark-code` in the [playground](/play/)'s Config tab.

## Copy

Copy takes the code's text as written. It leaves out the highlighting, the line numbers, the lines marked `del`, and the row that counts a collapsed range's lines, so a diff copies as the code after the change. Your actions get the same text.

A check mark confirms the copy, and a status line tells screen readers. When the page can't write to the clipboard, such as over plain http, Copy selects the code instead and says to press Ctrl+C or ⌘C.

## Wrap

Wrap breaks long lines in its own block. It stays on until you press it again, and it isn't saved for the next visit. A block whose fence says `wrap` starts with it on. A numbered line wraps under its own code, not under its number.

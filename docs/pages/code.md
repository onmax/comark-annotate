---
title: comark-code
description: Copy and wrap buttons on code blocks.
tagline: Copy and Wrap on every code block, and buttons of your own, such as Run, that hand the code to your app.
install: pnpm add comark @comark/html comark-code
---

::examples
:::example{label="Copy and wrap"}
````md
```sh
pnpm add comark @comark/html comark-code && pnpm exec comark-lint docs/**/*.md --max-warnings 0 --format text
```
````
:::
::

Point at a code block to show its buttons, which stay visible on touch screens. Wrap breaks long lines in that block only, and Copy puts its code on the clipboard. Without a script, the block shows as it would without the plugin, with no buttons.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import code, { components } from "comark-code/html";

const render = createHtmlRenderer({ plugins: [code()], components });
```

The components replace how `pre` renders. The block keeps its own markup, so Shiki's highlighting and your `pre` styles still apply, and it works in a [code group](/tabs/#components-code-group) whichever plugin comes first.

For Vue, React, or Svelte, import from `comark-code/vue`, `comark-code/react`, or `comark-code/svelte` (Svelte 5.20 or later). [Renderers](/guide/renderers/) covers server rendering and using it with other plugins.

## Guides

### Actions

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

The plugin does nothing else, so `code()` with no actions only adds Copy and Wrap, which come from the components.

### Copy

Copy takes the code's text as written, without the highlighting. A check confirms it, and a status line tells screen readers. When the page can't write to the clipboard, such as over plain http, it selects the code instead and says to press Ctrl+C or ⌘C.

### Wrap

Wrap breaks long lines in its own block and stays on until it's pressed again, and it isn't saved for the next visit.

### Theming

The buttons follow the shared tokens in [Theming](/guide/theming/): they sit on `--comark-background` with a `--comark-border` frame, and turn `--comark-accent` on hover and while Wrap is on. Wrap's rule is the one outside the `comark` layer, so it beats a page's own `white-space`; move the bar with a plain rule, such as `.ck-bar { top: 0.75rem }`.

## Credits

The icons are from [Lucide](https://lucide.dev).

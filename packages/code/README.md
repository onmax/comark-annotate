# comark-code

[![npm version](https://npmx.dev/api/registry/badge/version/comark-code)](https://npmx.dev/package/comark-code)
[![npm downloads](https://npmx.dev/api/registry/badge/downloads-month/comark-code)](https://npmx.dev/package/comark-code)
[![install size](https://npmx.dev/api/registry/badge/size/comark-code)](https://npmx.dev/package/comark-code)
[![license](https://npmx.dev/api/registry/badge/license/comark-code)](https://npmx.dev/package/comark-code)
[![docs](https://img.shields.io/badge/docs-comark.onmax.me-14b8a6?labelColor=0a0a0a)](https://comark.onmax.me/code/)

Copy and Wrap buttons on every Markdown code block, plus buttons of your own, such as Run, that hand the block's code to your app. Without a script the block shows as it would without the plugin. A [Comark](https://comark.dev) plugin for HTML, Vue, React, and Svelte.

```sh
pnpm add comark comark-code
```

```ts
import { createHtmlRenderer } from "@comark/html";
import code, { components } from "comark-code/html";

const render = createHtmlRenderer({ plugins: [code()], components });
```

The components replace how `pre` renders, and keep the block's own markup inside a wrapper, so Shiki's highlighting and your `pre` styles still apply. They work in a `comark-tabs` code group whichever plugin comes first.

Copy writes the code to the clipboard and shows a check. When the page can't write to it, such as over plain http, it selects the code and says to press Ctrl+C or ⌘C. Wrap breaks long lines in that block until it's pressed again.

## Actions

Each action is a button on the code blocks in its `languages`, or on every block without them:

```ts
const render = createHtmlRenderer({
  plugins: [code({ actions: [{ id: "run", label: "Run", languages: ["sh", "bash"] }] })],
  components,
});

document.addEventListener("comark-code-action", (event) => {
  const { action, code, language } = event.detail;
  if (action === "run") terminal.run(code);
});
```

A click sends a `comark-code-action` event from the block that bubbles up to the page, and your app decides what the action does.

## Renderers

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-code/html`: the styles and script are inlined once per document |
| `@comark/vue` | `comark-code/vue` |
| `@comark/react` | `comark-code/react` |
| `@comark/svelte` | `comark-code/svelte`, Svelte 5.20 or later |

Each entry exports the parse plugin as `default` and the renderer's `components`.

The buttons read shadcn's CSS variables, such as `--background` and `--border`, when the page has them, and use its neutral theme otherwise. Set the `--comark-*` tokens to theme every comark plugin at once. The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the one that wraps lines. `--ck-inset` moves the bar and `--ck-button-size` sizes its buttons; see the code's [Theming page](https://comark.onmax.me/code/theming/).

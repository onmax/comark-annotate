---
title: comark-github
description: GitHub's alerts, references, and raw HTML, rendered as on GitHub.
tagline: Write > [!NOTE], @user, #123, and <sub> as on GitHub, and get the same page anywhere.
install: pnpm add comark @comark/html comark-github
---

::examples
:::example{label="Callouts"}
```md
> [!NOTE]
> Drafts save every few seconds, so closing the tab keeps your work.

> [!TIP]
> Press ⌘K to search every document.

> [!IMPORTANT]
> Releases ship from `main` only.

> [!WARNING]
> Changing the slug breaks links people already shared.

> [!CAUTION]
> Deleting a folder deletes every document in it.
```
:::

:::example{label="Custom title"}
```md
> [!IMPORTANT] Decision
> Keep the existing endpoint. Clients pin its response shape.
```
:::

:::example{label="Callout with any content"}
```md
> [!WARNING] Breaking change in v2
> The `render` option moved:
>
> - `render(markdown)` is now `createHtmlRenderer()(markdown)`
> - `components` keys are tag names
>
> ```ts
> const render = createHtmlRenderer({ plugins, components });
> ```
```
:::

:::example{label="References"}
```md
Thanks @onmax: this fixes #51, and onmax/comark-plugins#73 builds on it.
```
:::

:::example{label="HTML"}
```md
Press <kbd>⌘</kbd> <kbd>K</kbd> to search. Water is H<sub>2</sub>O.

<p align="center">
  <img src="/after.png" width="240" alt="The dashboard after the fix">
</p>

<details>
<summary>Why no script?</summary>
GitHub drops it, and so does this: <script>alert("hi")</script>
</details>
```
:::
::

Three plugins, each one on its own:

- `callouts()` draws GitHub's five alerts with an icon, a color, and a title. Text after the marker on its line replaces the title. Comark's built-in [alert plugin](https://comark.dev/plugins/defaults/alert) only tags the quote with its type and leaves the drawing to you.
- `references({ repo })` links `@user` to the profile and `#123` or `owner/name#123` to the issue or pull request, as GitHub does in comments.
- `html()` renders raw HTML the way GitHub does: its tags and attributes stay, scripts and anything else it doesn't allow go. Comark renders all raw HTML as written.

---
title: comark-github
description: GitHub's alerts, references, and raw HTML, rendered as on GitHub.
keywords: callout, alert, admonition, note, tip, important, warning, caution, GFM, GitHub Flavored Markdown, issue links, mentions, raw HTML, sanitize, blockquote
tagline: Write > [!NOTE], @user, #123, and <sub> as on GitHub, and get the same page anywhere.
install: pnpm add comark @comark/html comark-github
group: Review blocks
icon: github
blurb: 'GitHub''s alerts, references, and HTML'
credits: 'Syntax from <a href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax">GitHub''s Markdown</a>, and the allowed HTML from its <a href="https://github.com/gjtorikian/html-pipeline">html-pipeline</a>.'
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

:::example{label="Lists and code"}
```md
> [!WARNING] Breaking change in v2
> `render(markdown)` is gone. Create a renderer once instead:
>
> - pass it your `plugins` and `components`
> - key `components` by tag name
>
> ```ts
> const render = createHtmlRenderer({ plugins, components });
> ```
```
:::

:::example{label="References"}
```md
Thanks @onmax: this fixes #51, and onmax/comark-ui#73 builds on it.
```
:::

:::example{label="HTML"}
```md
Press <kbd>⌘</kbd> <kbd>K</kbd> to search. Water is H<sub>2</sub>O.

<img src="/dashboard.png" width="480" alt="Office correlations: ducks vs. bugs, r = 0.94">

<details>
<summary>Where did the script go?</summary>
The source has a <code>&lt;script&gt;</code> after this sentence. GitHub drops it, and so does <code>html()</code>. <script>alert("hi")</script>
</details>
```
:::
::

Three plugins, each one on its own:

- `callouts()` draws GitHub's five alerts with an icon, a color, and a title. Text after the marker on its line replaces the title. Comark's built-in [alert plugin](https://comark.dev/plugins/defaults/alert) only tags the quote with its type and leaves the drawing to you.
- `references({ repo })` links `@user` to the profile and `#123` or `owner/name#123` to the issue or pull request, as GitHub does in comments.
- `html()` renders raw HTML the way GitHub does. GitHub's tags and attributes stay, and scripts and anything else it doesn't allow go. Comark renders all raw HTML as written.

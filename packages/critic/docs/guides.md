---
title: Guides
description: Reviewing a draft, publishing the accepted text, and why Comark needs the plugin for this.
---

## Review, then publish

Keep the suggestions in the source while a draft is in review, and render it twice: once with `mode: "view"` for the reviewers, and once with `mode: "accept"` for the page you publish. The source stays one file, and nobody copies the accepted text by hand.

```ts
const review = await parseMarkdown(draft, { plugins: [critic()] });
const published = await parseMarkdown(draft, { plugins: [critic({ mode: "accept" })] });
```

Removing a word leaves the spaces around it, so `a {--big--} duck` accepts as `a  duck`. HTML collapses the two spaces into one.

## Without the plugin

Comark reads a `{` in text as the start of attributes. Without this plugin, `{++fifteen++}` doesn't stay as text: the attribute rule takes the whole mark and renders nothing, so a suggestion vanishes from the page without a warning. The plugin's rule runs first and leaves every other brace, such as `{.class}` and `{#id}`, to Comark.

## Theming

Comments are a `<span class="ccm-comment">`, a muted pill that reads these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-accent` | The pill |
| `--comark-muted` | The comment's text |
| `--comark-radius` | Corners |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins. The package doesn't style `ins`, `del`, and `mark`, so the browser's styles or your own apply. Restyle them with plain CSS, for instance as a pull request colors them:

```css
ins {
  background: #dafbe1;
  text-decoration: none;
}
del {
  background: #ffebe9;
}
```

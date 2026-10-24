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

Each mark carries a class, so the styles reach only CriticMarkup and not a `~~strikethrough~~`, which Comark also writes as `<del>`. An insertion is tinted green over a line, a deletion struck through in red, a highlight amber, and a comment a muted chip. They read these [shared tokens](/guide/theming/):

| Token | Used for |
| --- | --- |
| `--comark-accent` | The comment's chip |
| `--comark-border` | The chip's edge |
| `--comark-foreground` | A deletion's text, mixed with its red |
| `--comark-muted` | The comment's text |
| `--comark-radius` | Corners |

The colors are variables of their own. The deletion's red is shadcn/ui's `--destructive` when the page has it:

| Variable | Default |
| --- | --- |
| `--ccm-ins` | Green |
| `--ccm-del` | `--destructive`, else red |
| `--ccm-mark` | Amber |

The rules sit in a `comark` CSS layer, so any plain rule of your own wins. Recolor them as a pull request does, for instance:

```css
:root {
  --ccm-ins: #1a7f37;
  --ccm-del: #cf222e;
}
```

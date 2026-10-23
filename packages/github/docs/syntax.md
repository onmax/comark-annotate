---
title: Syntax
description: Callouts, references, and the HTML GitHub allows.
---

## Callouts

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

The marker is case-insensitive. Callouts work inside lists and other blocks. A quote marked with any other type, such as `[!INFO]`, stays a plain quote, and `meta.issues` names it, with its own rule in [Doctor](/doctor/).

## References

| Written | Links to |
| --- | --- |
| `@user` | `https://github.com/user` |
| `#123` | `https://github.com/<repo>/issues/123`, when `repo` is set; GitHub redirects it to the pull request when it is one |
| `owner/name#123` | `https://github.com/owner/name/issues/123` |

A reference must stand on its own: `me@example.com`, `C#9`, and `@comark/html` stay text. So does anything in a link or in code.

## HTML

These tags stay, as on GitHub: `a`, `abbr`, `b`, `bdo`, `blockquote`, `br`, `caption`, `cite`, `code`, `dd`, `del`, `details`, `dfn`, `div`, `dl`, `dt`, `em`, `figcaption`, `figure`, `h1` to `h6`, `hr`, `i`, `img`, `ins`, `kbd`, `li`, `mark`, `ol`, `p`, `picture`, `pre`, `q`, `rp`, `rt`, `ruby`, `s`, `samp`, `small`, `source`, `span`, `strike`, `strong`, `sub`, `summary`, `sup`, `table`, `tbody`, `td`, `tfoot`, `th`, `thead`, `time`, `tr`, `tt`, `ul`, `var`, and `wbr`.

- `script` and `style` are removed with their content. Any other tag, such as `iframe`, `form`, or a component's tag, is replaced by its content.
- Attributes that change the layout or describe the content stay, such as `align`, `width`, `height`, `alt`, `title`, `open`, `colspan`, and `aria-label`, plus `href` on links, `src` and `srcset` on images, and `srcset` and `media` on `source`. `class`, `id`, `style`, and event handlers such as `onclick` go.
- A URL must be relative, http, or https, or mailto in a link. Any other, such as `javascript:` or `data:`, is removed.

Markdown between an HTML tag and its closing tag, after a blank line, renders after the element instead of inside it, until Comark fixes [comark#235](https://github.com/comarkdown/comark/issues/235). Content on the lines right after the opening tag, with no blank line, stays inside, but as plain text.

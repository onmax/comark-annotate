---
title: Syntax
description: The icon component and its names.
---

```md
:icon{name="lucide:apple"}
:icon{name="lucide:apple" label="Apple"}
```

| Prop | |
| --- | --- |
| `name` | An icon: `set:name`, such as `lucide:apple`, or the URL of an image. Required. Browse the sets at [icones.js.org](https://icones.js.org). |
| `label` | What the icon means, for screen readers. Without one, the icon is decoration and they skip it. |

Give a `label` when the icon carries meaning the text around it doesn't, such as a lone status icon; leave it out when a word next to it says the same.

## Names

Write `set:name`. Nuxt UI's `i-lucide-apple` and `i-lucide:apple` work too, so Markdown written for Nuxt UI renders the same. A name can be bound to the front matter, as `:icon{:name="frontmatter.icon"}`.

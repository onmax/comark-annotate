---
title: Guides
description: Validation, and drawing icons from another plugin.
---

## Validation

The plugin checks every icon while parsing and adds the problems to `meta.issues`. An icon it can't draw is left out of the page.

```txt
`:icon` 1 ("lucide:aple"): The `lucide` set has no icon `aple`. Find its name at https://icones.js.org/collection/lucide.
```

It reports an icon without a `name`, a name that isn't `set:name` or a URL, a set or icon Iconify doesn't have, a request that failed, and a prop `:icon` doesn't read. Each one has its own rule in [Doctor](/doctor/). Rendering never throws.

## Icons in another plugin

A plugin that draws icons, such as tab icons, takes an `Icons` from `createIcons()` and resolves every icon it needs in one call while parsing:

```ts
import { createIcons, describeIconProblem, iconProblemRule, type Icons } from "comark-icon";

const resolved = await icons.resolve(["lucide:apple", "logos:pnpm"]);
for (const [name, icon] of resolved) {
  if ("problem" in icon) {
    const issue = `Tab 1: ${describeIconProblem(name, icon)}`;
    issues.push(issue);
    issueRules[issue] = iconProblemRule(icon); // such as "comark/icon/unknown-icon"
  } else node[1].icon = icon; // { name, src, ratio, mask }
}
```

Put each sentence in `meta.issues` and its rule from `iconProblemRule()` in `meta.issueRules`, so comark-linter reports the problem under the same rule as an `:icon`'s.

Its renderers draw each icon with this package's: `iconHtml()` and `iconStyles(state)` from `comark-icon/html`, and the `Icon` component from `comark-icon/vue`, `/react`, and `/svelte`. The icons then look and size the same as `:icon`.

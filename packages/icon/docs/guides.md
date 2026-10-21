---
title: Guides
description: Validation, and drawing icons from another plugin.
---

## Validation

The plugin checks every icon while parsing and adds the problems to `meta.issues`. An icon it can't draw is left out of the page.

```txt
`:icon` 1 ("lucide:aple"): The `lucide` set has no icon `aple`. Find its name at https://icones.js.org/collection/lucide.
```

It reports an icon without a `name`, a name that isn't `set:name` or a URL, a set or icon Iconify doesn't have, and a request that failed. Rendering never throws.

## Icons in another plugin

A plugin that draws icons, such as tab icons, takes an `Icons` from `createIcons()` and resolves every icon it needs in one call while parsing:

```ts
import { createIcons, describeIconProblem, type Icons } from "comark-icon";

const resolved = await icons.resolve(["lucide:apple", "logos:pnpm"]);
for (const [name, icon] of resolved) {
  if ("problem" in icon) issues.push(`Tab 1: ${describeIconProblem(name, icon)}`);
  else node[1].icon = icon; // { name, src, ratio, mask }
}
```

Its renderers draw each icon with this package's: `iconHtml()` and `iconStyles(state)` from `comark-icon/html`, and the `Icon` component from `comark-icon/vue`, `/react`, and `/svelte`. The icons then look and size the same as `:icon`.

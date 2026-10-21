---
title: comark-github-callouts
description: GitHub's alerts as callouts with an icon and a title, written in Markdown.
tagline: Write > [!NOTE] through > [!CAUTION] as on GitHub, and get a shadcn-style callout on any page.
install: pnpm add comark @comark/html comark-github-callouts
---

::examples
:::example{label="Types"}
```md
> [!NOTE]
> Pigeon counts update every five minutes, from the camera on the roof.

> [!TIP]
> Order pizza before you open a pull request. It merges 31% faster.

> [!IMPORTANT]
> Deploys ship only when fewer than 12 pigeons are on the roof.

> [!WARNING]
> Renaming the duck breaks its correlation with bugs fixed.

> [!CAUTION]
> Resetting the duck counter deletes three years of correlations.
```
:::

:::example{label="Custom title"}
```md
> [!IMPORTANT] Decision
> Keep the third rubber duck. Bugs fixed fell 40% the week it went missing.
```
:::

:::example{label="Any content"}
```md
> [!WARNING] Breaking change in v2
> The `correlate` option moved:
>
> - `correlate(ducks, bugs)` is now `createSpurious()(ducks, bugs)`
> - `weather` is in hours of rain
>
> ```ts
> const correlate = createSpurious({ office, moonPhase: "waxing" });
> ```
```
:::
::

The five types are GitHub's. Each gets its icon, its color, and its title; the text after the marker on its line replaces the title.

Comark's built-in [alert plugin](https://comark.dev/plugins/defaults/alert) already reads these markers: it tags the quote with its type and leaves the drawing to you. Use this package when you want them drawn: the icon, the title, and the styles in every renderer, plus a title written on the marker's line and configurable default titles.

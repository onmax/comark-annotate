---
title: comark-code
description: Copy and wrap buttons on code blocks.
tagline: Copy and Wrap on every code block, and buttons of your own, such as Run, that hand the code to your app.
install: pnpm add comark @comark/html comark-code
---

::examples
:::example{label="Copy and wrap"}
````md
```sh
pnpm exec spurious correlate --x "rubber ducks bought" --y "bugs fixed" --office berlin --moon-phase waxing --min-r 0.9 > ducks.csv
```
````
:::
::

Point at a code block to show its buttons, which stay visible on touch screens. Wrap breaks long lines in that block only, and Copy puts its code on the clipboard. Without a script, the block shows as it would without the plugin, with no buttons.

## Credits

The icons are from [Lucide](https://lucide.dev).

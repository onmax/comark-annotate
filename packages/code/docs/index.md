---
title: comark-code
description: Copy and wrap buttons on code blocks.
tagline: Copy and Wrap on every code block, and buttons of your own, such as Run, that hand the code to your app.
install: pnpm add comark @comark/html comark-code
group: Page behavior
icon: square-code
blurb: Copy and wrap buttons on code
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

The `spurious` command above is fictional sample code used to demonstrate a long shell line.

Each code block gets a header above its first line, with the file's name or the language on the left and the buttons on the right, so they never cover the code. Wrap breaks long lines in that block only, and Copy puts its code on the clipboard. Without a script the header keeps its title and hides the buttons, which couldn't work.

## Credits

The icons are from [Lucide](https://lucide.dev).

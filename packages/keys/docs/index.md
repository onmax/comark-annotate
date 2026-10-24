---
title: comark-keys
description: Keyboard shortcuts in Markdown, rendered as kbd keys.
tagline: Write ++ctrl+shift+k++ and get each key in its own kbd, named the way people read them, with no component.
install: pnpm add comark comark-keys
group: Markdown syntax
icon: keyboard
blurb: Keyboard shortcuts as kbd keys
credits: 'Syntax, key names, and aliases from <a href="https://facelessuser.github.io/pymdown-extensions/extensions/keys/">pymdownx.keys</a> by Isaac Muse.'
---

::examples
:::example{label="Shortcuts"}
```md
Press ++ctrl+shift+k++ to open the pigeon counter, and ++esc++ to close it.

On a Mac, it's ++cmd+opt+k++. Page through the log with ++pg-up++ and ++pg-dn++.
```
:::

:::example{label="Custom keys"}
```md
Hold ++shift++ and press ++"Duck Button"++ to page the rubber duck.

Deploy with ++ctrl+alt+"🍕"++ on Fridays only.
```
:::
::

Keys go between `++` and `++`, joined by `+`. Each renders as a `<kbd>` with its usual name, so `ctrl` reads Ctrl and `pg-dn` reads Page Down, and the whole shortcut sits in a `.ckb` span.

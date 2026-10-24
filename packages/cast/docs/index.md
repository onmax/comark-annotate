---
title: comark-cast
description: Terminal recordings from asciinema casts, as colored text written in Markdown.
keywords: asciinema, terminal, shell, console, command output, CLI output, recording, screencast, ANSI colors, tty
tagline: Record a command with asciinema and show what it printed, colors and all, as text a reader can select. No player, no script.
install: pnpm add comark @comark/html comark-cast
group: Review blocks
icon: square-terminal
blurb: Terminal recordings as text
credits: 'Reads <a href="https://docs.asciinema.org/manual/asciicast/v2/">asciinema</a>''s cast files.'
---

::examples
:::example{label="Test run"}
````md
::cast{title="pnpm test"}
```json
{"version": 2, "width": 52, "height": 9}
[0.3, "o", "$ pnpm test\r\n"]
[0.6, "o", "\r\n \u001b[7m\u001b[36m RUN \u001b[39m\u001b[27m v3.2.4 /pigeon-tracker\r\n\r\n"]
[0.9, "o", " \u001b[32m\u2713\u001b[39m test/flock.test.ts \u001b[2m(6 tests)\u001b[22m\r\n"]
[1.2, "o", " \u001b[32m\u2713\u001b[39m test/routes.test.ts \u001b[2m(4 tests)\u001b[22m\r\n"]
[1.5, "o", " \u001b[31m\u2717\u001b[39m test/homing.test.ts \u001b[2m(3 tests | \u001b[22m\u001b[31m1 failed\u001b[39m\u001b[2m)\u001b[22m\r\n"]
[1.8, "o", "\r\n \u001b[2mTests\u001b[22m  \u001b[1m\u001b[31m1 failed\u001b[39m\u001b[22m | \u001b[1m\u001b[32m12 passed\u001b[39m\u001b[22m\r\n"]
```
::
````
:::

:::example{label="Final screen"}
````md
::cast{title="pnpm build"}
```json
{"version": 2, "width": 52, "height": 4}
[0.3, "o", "$ pnpm build\r\n"]
[0.6, "o", "Bundling \u001b[33m[=====     ]\u001b[39m 48%"]
[0.9, "o", "\r\u001b[KBundling \u001b[33m[========= ]\u001b[39m 91%"]
[1.2, "o", "\r\u001b[KBundling \u001b[32m[==========]\u001b[39m done\r\n"]
[1.5, "o", "\u001b[2mdist/\u001b[22m\u001b[36mpigeons.js\u001b[39m  \u001b[1m12.4 kB\u001b[22m\r\n"]
[1.8, "o", "\u001b[2mdist/\u001b[22m\u001b[35mstyle.css\u001b[39m   \u001b[1m3.1 kB\u001b[22m\r\n"]
[2.1, "o", "\u001b[32m\u2713 built in 412ms\u001b[39m\r\n"]
```
::
````
:::

:::example{label="Log"}
````md
::cast{title="pnpm build" mode="log"}
```json
{"version": 2, "width": 52, "height": 4}
[0.3, "o", "$ pnpm build\r\n"]
[0.6, "o", "Bundling \u001b[33m[=====     ]\u001b[39m 48%"]
[0.9, "o", "\r\u001b[KBundling \u001b[33m[========= ]\u001b[39m 91%"]
[1.2, "o", "\r\u001b[KBundling \u001b[32m[==========]\u001b[39m done\r\n"]
[1.5, "o", "\u001b[2mdist/\u001b[22m\u001b[36mpigeons.js\u001b[39m  \u001b[1m12.4 kB\u001b[22m\r\n"]
[1.8, "o", "\u001b[2mdist/\u001b[22m\u001b[35mstyle.css\u001b[39m   \u001b[1m3.1 kB\u001b[22m\r\n"]
[2.1, "o", "\u001b[32m\u2713 built in 412ms\u001b[39m\r\n"]
```
::
````
:::
::

A cast is replayed through a small terminal while parsing, so the page gets the screen as the terminal last showed it: a progress bar redrawn in place shows only its last state, and a cleared screen is gone. With `mode="log"`, lines that scrolled off the top stay too. The asciinema player weighs 1.4 MB; this is a `pre` with colored spans.

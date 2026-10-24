---
title: Syntax
description: The props of ::cast, and what the terminal replays.
---

```md
::cast{src="test.cast" title="pnpm test" mode="log"}
::
```

| Prop | What it does |
| --- | --- |
| `src` | The cast file, relative to the plugin's `root`. Only local files are read. |
| `mode` | `screen`, the default, shows the terminal's last screen. `log` shows every line printed, from the first. |
| `title` | A caption above the terminal. |

A short cast can sit inside the block instead of in a file, in a code block of its own:

````md
::cast
```json
{"version": 2, "width": 40, "height": 3}
[0.2, "o", "\u001b[32m✓\u001b[39m 12 passed\r\n"]
```
::
````

## What it replays

Output events (`"o"`) and resizes (`"r"`) are replayed; input, markers, and the exit code draw nothing. The terminal knows enough of xterm for what command-line tools print:

- The 16 colors, 256 colors, and 24-bit colors, for text and background, and bold, dim, italic, underline, strikethrough, and inverse.
- Carriage returns and backspaces, cursor moves and positions, erasing a line or the screen, and tabs.
- Wide characters such as CJK and emoji, and long lines wrapping at the terminal's width.
- The alternate screen of full-screen apps such as `vim` or `less`, which disappears when they quit, as in a real terminal.

Window titles and links are dropped. A bare `\n` starts a new line from the left, so a cast written by hand doesn't need `\r\n`.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: no cast, a file it can't find or read or that sits outside `root`, a first line that isn't a v2 or v3 header, a line that isn't an event, a cast with no output, a `mode` it doesn't know, and a prop it doesn't read. Each issue names its block and says how to fix it, and each has its own rule in [Doctor](/doctor/). A cast it can't read renders nothing.

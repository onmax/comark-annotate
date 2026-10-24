---
title: Guides
description: Show a command's output in a pull request, and theme the terminal.
---

## Show a command's output in a review

A screenshot of a terminal can't be searched or copied, and pasting the output loses its colors. Record the command instead and put the cast next to the document:

```sh
asciinema rec --cols 80 --rows 12 --command "pnpm test" evidence/test.cast
```

```md
The flaky homing test passes now:

::cast{src="evidence/test.cast" title="pnpm test"}
::
```

Use `mode="log"` when the part that matters scrolled off the screen, such as the first error in a long build. Keep `--rows` small for the default mode, so the screen holds only the end of the run.

## Theming

The terminal is a window in the page's scheme, as shadcn/ui draws a code block: a muted surface with a border and three dots. Its 16 colors switch with the scheme, darker on a light page so a program's white and yellow still read, whether the system or a `.light` or `.dark` class above sets it. Set these on `.cca`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cca-background` | `--comark-accent` mixed into `--comark-background` | The terminal's background, and inverted text |
| `--cca-foreground` | `--comark-foreground` | Text with no color, and inverted backgrounds |
| `--cca-0` to `--cca-15` | Tailwind's zinc, red, green, yellow, blue, purple, and cyan, a shade darker on a light page | The 16 terminal colors, then their bright versions |

256-color and 24-bit colors are written as they were recorded. The frame reads the [shared tokens](/guide/theming/) `--comark-border` and `--comark-radius`, the dots and the caption `--comark-muted`, and the caption `--comark-font`. The rules sit in a `comark` CSS layer, so any plain rule of your own wins, except the terminal's background, text color, and margin: a page's `pre` styles would put the program's colors on the wrong ground or push the terminal away from its caption, so change the colors through the variables and space the `.cca` figure instead.

| Class | Element |
| --- | --- |
| `.cca` | The figure, with `data-mode` set to `screen` or `log` |
| `.cca-term` | The terminal's `pre` |
| `.cca-f0` to `.cca-f15`, `.cca-b0` to `.cca-b15` | Text and background in a terminal color |
| `.cca-bold`, `.cca-dim`, `.cca-italic`, `.cca-underline`, `.cca-strike` | Text styles |

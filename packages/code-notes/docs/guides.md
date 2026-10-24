---
title: Guides
description: Notes in a pull request, plugin order, and why it isn't part of comark-code.
---

## Notes in a pull request

Annotate the lines a reviewer would ask about: the request that runs in parallel, the case that returns early, the number that came from a benchmark. Keep each note to a sentence or two; a longer explanation belongs in the text around the block.

The source stays readable without the plugin. On GitHub, the comments show in the code and the notes as a numbered list under it.

## Plugin order

The plugin takes the markers out of the code before any plugin runs, so Shiki highlights the code without them. It draws the markers back once the tree is built, into the lines Shiki wrote, so it has to come after `shiki` in `plugins`:

```ts
const render = createHtmlRenderer({ plugins: [shiki(), codeNotes(), code()], components });
```

In the other order the code isn't highlighted, and `meta.issues` says to move it.

## With comark-code

[comark-code](/code/) wraps each block in its bar of buttons, and the markers sit inside the code it wraps. The marker's number is drawn by CSS, so Copy takes only the code. The two are separate packages because the notes need nothing from the buttons: comark-code replaces `pre`, and this plugin only adds markers to its lines and turns the list under it into notes.

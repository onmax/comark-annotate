---
title: Syntax
description: Line markers, diffs, collapsed ranges, line numbers, titles, and terminal frames, written after a fence's language.
---

````md
```ts title="src/limits.ts" ins={3} del={2} collapse={5-9} showLineNumbers
export const limits = {
  filters: 3,
  filters: 5,
  sorts: 2,
  // …
};
```
````

Write each option after the fence's language, the way [Expressive Code](https://expressive-code.com) writes them, so a block written for Expressive Code renders the same here. Comark's own `[file]` and `{2}` work beside them.

| Option | |
| --- | --- |
| `ins={3-4}` | Marks lines as added: green, with a `+` before them. |
| `del={2}` | Marks lines as deleted: red, with a `−` before them. Copy leaves them out. |
| `mark={7}` | Marks lines to look at, like Comark's `{7}`. |
| `collapse={1-40}` | Folds lines behind a row that says how many there are. A click opens them, and they stay open. |
| `showLineNumbers` | Numbers the lines. |
| `startLineNumber=120` | Numbers the lines from 120, and turns the numbers on. |
| `title="src/x.ts"` | The block's title, like `[src/x.ts]`. |
| `frame="terminal"` | Draws the block as a terminal window. `frame="none"` or `frame="code"` draws a plain block. |
| `wrap` | Starts the block with Wrap on. |

A range is one line, `{7}`, or the first and last lines of a run, `{3-4}`, and a list takes both, `{1, 3-4}`. Lines count from 1, and collapsed lines are counted where they are.

`sh`, `bash`, `zsh`, `shell`, `console`, and `ansi` blocks are terminals unless their title is a file's name, like `install.sh`. A terminal's header shows its title, if it has one, but not its language. In a [code group](/tabs/components/#code-group) the tab names the block, so a terminal there draws no window.

The components draw the options with no script beyond the one the buttons already need. A collapsed range is a `<details>` element. The numbers and the signs come from CSS, so selecting the code and copying it gets only the code.

## Diffs

A `diff` fence with a `lang` is highlighted as that language. Each line's leading `+` or `-` becomes `ins` or `del`:

````md
```diff lang="ts"
 function close() {
   dialog.close();
-  history.back();
+  if (opened) history.back();
 }
```
````

Paste the output of `git diff` as it is. When the block has `@@` hunk headers, the plugin drops the hunk headers and the file headers before the first hunk. Without `lang`, a `diff` fence stays a diff in Shiki's colors.

## Shiki

List `shiki` before comark-code in `plugins`:

```ts
const render = createHtmlRenderer({ plugins: [shiki(), code()], components });
```

Shiki draws every block again from its text, so comark-code marks the lines once Shiki has drawn them. If comark-code comes first, a block keeps its title, frame, and Wrap. It loses its markers, numbers, and collapsed ranges, and the plugin says so in `meta.issues`. Without Shiki, comark-code splits the lines itself.

Shiki's [notation transformers](https://shiki.style/packages/transformers) work too. comark-code styles the lines they mark with `// [!code ++]`, `// [!code --]`, `// [!code highlight]`, `// [!code focus]`, `// [!code error]`, and `// [!code warning]`, and the words `// [!code word:name]` marks.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes, and never throws:

- A range past the block's last line.
- A range that isn't in braces.
- A `startLineNumber` that isn't a whole number.
- A frame it doesn't draw.

Each issue names the block by its title, or else by its first line, and says how to write it. Each one has its own rule in [Doctor](/doctor/).

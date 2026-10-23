---
title: Syntax
description: The diff block and its props.
---

````md
::diff{line=212 label="Suggested change"}
```ts [packages/zoom/src/client.ts]
history.back();
```
```ts
if (opened) history.back();
```
::
````

Write two ordinary fenced blocks, before then after, and nothing else inside. Leave the first block empty for a new file, or the second for a deleted one.

| Prop | |
| --- | --- |
| `file` | The file's path. Defaults to the name on the first block, like `` ```ts [src/a.ts] ``; one of the two is required. |
| `line` | The file's line number for the first line of both blocks. Without it, the diff has no line numbers. |
| `label` | A heading before the file name, such as "Suggested change". |

Keep both blocks to the lines around the change. One diff shows one file and takes no unified diff. It's for a change a reader should see, and a few lines before and after show that best. The plugin reports a block over 200 lines, two blocks in different languages or files, and a diff with no change.

The line numbers and the `+` and `−` come from CSS, so copying a selection copies only the code. With Comark's `shiki` plugin, both blocks keep their highlighting, and a line a block highlights, like `` ```ts {2} ``, stays highlighted.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes. Each issue names its diff, by its file, and says how to fix it. Each kind has its own rule in [Doctor](/doctor/).

---
title: comark-diff
description: A code change in Markdown, shown like a suggested change in a pull request review.
tagline: Write a file's lines before and after as two code blocks and get a suggested change, the way a review shows one, with no script.
install: pnpm add comark @comark/html comark-diff
group: Review blocks
icon: file-diff
blurb: Compare two code fences
---

::examples
:::example{label="Suggested change"}
````md
::diff{line=212 label="Suggested change"}
```ts [packages/zoom/src/client.ts]
function close() {
  dialog.close();
  history.back();
}
```
```ts
function close() {
  dialog.close();
  if (opened) history.back();
}
```
::
````
:::

:::example{label="New file"}
````md
::diff{line=1}
```ts [src/limits.ts]
```
```ts
export const MAX_FILTERS = 3;
```
::
````
:::
::

The header shows the file and how many lines were added and removed. Removed lines are red and added lines green. Within a pair of changed lines, the words that changed are a shade deeper. The line numbers and the `+` and `−` come from CSS, so copying a selection copies only the code.

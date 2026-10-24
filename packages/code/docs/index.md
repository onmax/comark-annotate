---
title: comark-code
description: Copy and wrap buttons on code blocks.
keywords: copy button, copy to clipboard, clipboard, line wrap, word wrap, code block, run button, actions, Shiki
tagline: Copy and Wrap on every code block, and buttons of your own, such as Run, that hand the code to your app.
install: pnpm add comark @comark/html comark-code
group: Page behavior
icon: square-code
blurb: Copy and wrap buttons on code
credits: 'Icons from <a href="https://lucide.dev">Lucide</a>.'
---

::examples
:::example{label="Copy and wrap"}
````md
```sh
pnpm exec spurious correlate --x "rubber ducks bought" --y "bugs fixed" --office berlin --moon-phase waxing --min-r 0.9 > ducks.csv
```
````
:::

:::example{label="Line markers"}
````md
```ts title="src/zoom.ts" del={3} ins={4} mark={1} showLineNumbers
function close() {
  dialog.close();
  history.back();
  if (opened) history.back();
}
```
````
:::

:::example{label="Pasted diff"}
````md
```diff lang="ts"
@@ -12,4 +12,4 @@ export function close() {
 function close() {
   dialog.close();
-  history.back();
+  if (opened) history.back();
 }
```
````
:::

:::example{label="Collapsed lines"}
````md
```ts [vite.config.ts] collapse={2-7} startLineNumber=1
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import icons from "unplugin-icons/vite";
import components from "unplugin-vue-components/vite";
import inspect from "vite-plugin-inspect";
import checker from "vite-plugin-checker";
import { comark } from "./comark";

export default defineConfig({
  plugins: [comark(), vue()],
});
```
````
:::

:::example{label="Terminal"}
````md
```sh title="Install"
pnpm add comark @comark/html comark-code
```
````
:::
::

Each code block gets a header above its first line. The file's name or the language sits on the left and the buttons on the right, so they never cover the code. Copy puts the block's code on the clipboard, and Wrap breaks long lines in that block only. Without a script, the header keeps its title and hides the buttons, since they couldn't work.

Words after the fence's language, written the way [Expressive Code](https://expressive-code.com) writes them, mark lines as added, deleted, or worth a look. They can also fold runs of lines away, number the lines, and draw shell sessions as a terminal. A `diff` fence with a `lang` turns pasted `git diff` output into highlighted code with its lines marked. [Syntax](/code/syntax/) lists them all.

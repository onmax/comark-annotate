---
title: comark-cjk
description: Bold and italics that work next to Chinese, Japanese, and Korean punctuation.
tagline: Bold and italics that end in 。 or 」 right before the next word, where CommonMark leaves the asterisks on the page.
install: pnpm add comark comark-cjk
group: Markdown syntax
icon: languages
blurb: Emphasis in Chinese, Japanese, and Korean
credits: 'Runs <a href="https://github.com/tats-u/markdown-cjk-friendly">markdown-it-cjk-friendly</a> by tats-u.'
---

::examples
:::example{label="Japanese"}
```md
**この文は太字。**次の文は普通です。

会議は*「金曜日」*に移りました。

~~鳩の数を数える。~~もう数えません。
```
:::

:::example{label="Chinese and Korean"}
```md
**这句话是粗体。**下一句不是。

**이 문장은 굵게.**다음 문장은 아닙니다.
```
:::
::

Without the plugin, every line above shows its asterisks. CommonMark decides whether `**` opens or closes bold by the characters around it, and a closing `**` between `。` and the next word counts as neither, because Chinese, Japanese, and Korean put no space there. The plugin relaxes that rule next to those scripts only, so English and other text parses as before.

---
title: Guides
description: Where the rule comes from, and other editors and renderers.
---

## Where the rule comes from

The plugin runs [markdown-it-cjk-friendly](https://github.com/tats-u/markdown-cjk-friendly) by tats-u unchanged. Its repository holds the specification, a proposal for CommonMark, and versions of the same fix for remark and micromark, so a site that renders some pages with another Markdown tool can read them the same way.

## Streaming

Comark closes the bold a stream leaves open before parsing, so `**太字。` shows as bold while the rest arrives. Write `**` rather than `__` there too: an unmatched `__` is closed at the end of the line, not where you meant.

## On GitHub

GitHub's Markdown follows CommonMark here, so a README in Japanese still shows the asterisks there. Move the closing `**` before the punctuation, `**太字**。`, for text that has to read the same on GitHub.

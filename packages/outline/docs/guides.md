---
title: Guides
description: Long review documents, the sidebar, and theming.
---

## Long review documents

A review document that grows past a screen or two reads faster with its outline at the top: the reviewer sees what's covered and jumps to the part they own. Put `::toc` after the summary paragraph, and keep the headings short, since they become the links.

## A sidebar instead

For a contents list beside the page rather than in it, use Comark's own toc plugin, which writes the headings to `meta.toc` for your layout to draw. The two don't interfere.

## Theming

The list has no box, so it sits in the page like its text. It reads the [shared tokens](/guide/theming/): `--comark-foreground` for its title and first-level links, `--comark-muted` for the nested ones, `--comark-border` for the line beside them, `--comark-ring` for focus rings, and `--comark-font` for its text. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cto` | The `nav` |
| `.cto-title` | Its title |

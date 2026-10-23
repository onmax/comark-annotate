---
title: Guides
description: Long review documents, the sidebar, and theming.
---

## Long review documents

A review document that grows past a screen or two reads faster with its outline at the top: the reviewer sees what's covered and jumps to the part they own. Put `::toc` after the summary paragraph, and keep the headings short, since they become the links.

## A sidebar instead

For a contents list beside the page rather than in it, use Comark's own toc plugin, which writes the headings to `meta.toc` for your layout to draw. The two don't interfere.

## Theming

The box reads the [shared tokens](/guide/theming/): `--comark-background`, `--comark-foreground`, and `--comark-border` for the box, `--comark-muted` for its title and nested links, `--comark-ring` for focus rings, `--comark-radius` for its corners, and `--comark-font` for its text. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cto` | The `nav` |
| `.cto-title` | Its title |

---
title: comark-outline
description: A table of contents in the body of a page, written in Markdown.
keywords: TOC, table of contents, contents, headings list, navigation
tagline: Put a contents block where the list should go and get a nested list of links to the page's headings, kept in step with them on every render.
install: pnpm add comark @comark/html comark-outline
group: Authoring tools
icon: list-tree
blurb: A table of contents in the page
---

::examples
:::example{label="Contents"}
```md
::toc
::

## Feeding schedule

## Homing routes

### Short flights

### Long flights

## Known pigeons
```
:::

:::example{label="Deeper"}
```md
::toc{depth=4 title="On this page"}
::

## Setup

### Rings

#### Ring sizes

## Races
```
:::
::

The plugin reads the page's headings itself, with the ids Comark gives them, so a `::toc` works in any order with other plugins and doesn't need Comark's toc plugin, which only fills `meta.toc` for a sidebar.

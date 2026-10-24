---
title: Syntax
description: The fences the plugin draws, titles, and what happens when one fails.
---

## Fences

| Fence | Drawn by |
| --- | --- |
| ` ```plantuml ` | [PlantUML](https://plantuml.com): sequence, class, state, and other UML diagrams |
| ` ```graphviz ` or ` ```dot ` | [Graphviz](https://graphviz.org): graphs in the DOT language |
| ` ```d2 ` | [D2](https://d2lang.com): boxes and arrows in a short syntax |
| ` ```dbml ` | [DBML](https://dbml.dbdiagram.io): database tables and their relations |
| ` ```goat ` | [GoAT](https://github.com/blampe/goat): ASCII art as lines and arrows |
| ` ```svgbob ` | [Svgbob](https://github.com/ivanceras/svgbob): ASCII art as lines and arrows |

Every other fence stays code.

## Titles

A title in brackets after the language goes under the diagram and names it for screen readers:

````md
```d2 [Login flow]
user -> api -> db
```
````

## Failures

A diagram Kroki can't draw stays as code, and the plugin adds a sentence to `meta.issues`, as [Validation](/guide/validation/) describes, with the first line of the tool's error. So does a diagram drawn while the server can't be reached:

```txt
The ```dot fence 2: Kroki couldn't draw it: Error: <stdin>: syntax error in line 1 near 'a'. Fix the diagram's source.
The ```d2 fence 1: couldn't reach the Kroki server at https://kroki.io (fetch failed). Check `server`, or build again.
```

A diagram that failed is drawn again on the next parse. Each issue has its own rule in [Doctor](/doctor/).

## What's kept from the SVG

The plugin keeps the drawing and drops what could run: scripts, event handlers such as `onclick`, embedded HTML (`foreignObject`), animations, links that aren't to a web page or within the drawing, and `@import` in its styles. The XML prolog, doctype, and comments go too.

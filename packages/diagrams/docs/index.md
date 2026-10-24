---
title: comark-diagrams
description: PlantUML, Graphviz, D2, DBML, and ASCII diagrams in Markdown, drawn as SVG.
keywords: PlantUML, Graphviz, dot, D2, DBML, goat, svgbob, Kroki, flowchart, sequence diagram, UML, ER diagram, ERD, architecture diagram
tagline: Write a diagram in a fenced block and get it as SVG in the page, drawn while parsing by a Kroki server, with no script.
install: pnpm add comark @comark/html comark-diagrams
group: Review blocks
icon: workflow
blurb: Diagrams drawn through Kroki
credits: 'Drawn by <a href="https://kroki.io">Kroki</a>.'
---

::examples
:::example{label="D2"}
````md
```d2 [How a sighting reaches the map]
phone -> api: POST /sightings
api -> queue: dedupe
queue -> map: pigeon pin
```
````
:::

:::example{label="Graphviz"}
````md
```dot [Who feeds whom at the pond]
digraph {
  rankdir=LR
  bakery -> ducks -> pond
  bakery -> pigeons
}
```
````
:::

:::example{label="ASCII"}
````md
```svgbob
  .-------.     .--------.
  | ducks |---->| census |
  '-------'     '--------'
```
````
:::
::

A diagram in a review shows what changed in a flow or a schema faster than prose. The plugin sends each diagram's source to a [Kroki](https://kroki.io) server while parsing and puts the SVG it draws in the page, after taking out anything that could run. **The diagram's source leaves your machine**: it goes to `kroki.io` unless you [run your own Kroki](/diagrams/guides/).

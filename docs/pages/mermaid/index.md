---
title: Mermaid
description: Mermaid diagrams in Markdown, drawn to SVG while rendering, with no browser and no network.
tagline: Write a Mermaid diagram in a fenced block and get it as SVG in the page, drawn by Pele on the server and themed with the other blocks.
install: pnpm add comark @comark/html comark-pele
group: Review blocks
icon: network
blurb: Mermaid diagrams drawn by Pele
credits: 'Mermaid comes from <a href="https://github.com/farnabaz/comark-pele">comark-pele</a> by <a href="https://github.com/farnabaz">farnabaz</a>, drawn by <a href="https://pele.run">Pele</a>.'
---

::examples
:::example{label="Flowchart"}
````md
```mermaid
flowchart LR
  bread[Bread crumbs] --> ducks
  bread --> pigeons
  ducks --> pond[The pond]
```
````
:::

:::example{label="Sequence"}
````md
```mermaid
sequenceDiagram
  Agent->>Reviewer: Opens a PR with evidence
  Reviewer-->>Agent: Asks for a change
  Agent->>Reviewer: Pushes the fix
```
````
:::

:::example{label="Pie"}
````md
```mermaid
pie title Birds at the pond
  "Ducks": 12
  "Pigeons": 7
  "Geese": 3
```
````
:::
::

A diagram in a review shows a flow or a schema faster than prose, and Mermaid is the syntax agents and GitHub already write. [comark-pele](https://github.com/farnabaz/comark-pele) turns each `mermaid` fence into SVG with [Pele](https://pele.run), a Mermaid renderer with no dependencies, so the page needs no script and the diagram's source never leaves your machine.

comark-pele is a third-party plugin, by [farnabaz](https://github.com/farnabaz), not one of this repository's packages. [@onmax/comark](/preset/) registers it for you and puts its diagrams on the [shared tokens](/guide/theming/), so they match the other blocks in light and dark.

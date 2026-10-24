---
title: Guides
description: Where diagram sources go, running your own Kroki, and diagrams on a dark page.
---

## Where the source goes

Each diagram's source is sent to the Kroki server in a POST request while the document is parsed. With the default `server`, that's `https://kroki.io`, a free public service run by the Kroki project. Don't send it a diagram you wouldn't post publicly: an internal architecture, a schema with sensitive names, anything under an NDA.

The readers of the page never contact Kroki. They get the SVG inline.

## Run your own Kroki

Kroki is open source and runs from one container. The core image draws Graphviz, PlantUML, D2, DBML, GoAT, and Svgbob:

```sh
docker run -d -p 8000:8000 yuzutech/kroki
```

Then point the plugin at it:

```ts
diagrams({ server: "http://localhost:8000" });
```

In CI, run it as a service container next to the build. See [Kroki's install guide](https://docs.kroki.io/kroki/setup/install/) for other options.

## Diagrams on a dark page

The tools draw dark lines on white, so each diagram sits on a white card on any page, in its own frame. Set `--cdg-canvas` to change it, as [Theming](/diagrams/theming/) shows. A diagram wider than the page scrolls sideways inside its card.

## Styles from the SVG

Some tools, such as D2, put a `<style>` in their SVG, scoped to the drawing's own ids. Inline SVG shares the page's styles, so the plugin keeps those and only drops `@import`. Theming the diagram itself is up to the tool's own syntax.

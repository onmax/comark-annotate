---
title: Chart plugins compared
description: comark-charts next to comark-vega and comark-flint-chart, the other chart plugins for Comark.
tagline: Three Comark plugins draw charts with Vega. In comark-charts you write a Markdown table, so one block serves the people who look at the chart and the agents who read its numbers.
---

## One block, two readers

A review document has two readers. People look at the chart. Agents read the numbers: in the Markdown when they write it, and in the page when they check it. A drawing is a poor place to read them: bars are paths, labels show only the values that fit, and whatever numbers it holds are spread across its attributes.

So a `::chart` holds a Markdown table. The renderer draws the chart from it and keeps the table in the page, in the **Data** toggle under the chart. An agent writes a table it already knows how to write, a person sees the chart, and either can check a number against the other.

::example
```md
::chart{title="Bundle size by package (kB)"}
| package | size |
| --- | --: |
| annotate | 41.2 |
| embed | 12.4 |
| zoom | 18.1 |
::
```
::

The other two plugins draw the same chart from a JSON spec, and the page holds only the drawing:

::code-group
````md [comark-vega]
::vl
```
{
  "mark": "bar",
  "data": {
    "values": [
      { "package": "annotate", "size": 41.2 },
      { "package": "embed", "size": 12.4 },
      { "package": "zoom", "size": 18.1 }
    ]
  },
  "encoding": {
    "x": { "field": "package", "type": "nominal" },
    "y": { "field": "size", "type": "quantitative", "title": "size (kB)" }
  }
}
```
::
````

````md [comark-flint-chart]
```flint
{
  "data": {
    "values": [
      { "package": "annotate", "size": 41.2 },
      { "package": "embed", "size": 12.4 },
      { "package": "zoom", "size": 18.1 }
    ]
  },
  "semantic_types": { "package": "Category", "size": "Quantity" },
  "chart_spec": {
    "chartType": "Bar Chart",
    "encodings": { "x": { "field": "package" }, "y": { "field": "size" } }
  }
}
```
````
::

## At a glance

| | comark-charts | comark-vega | comark-flint-chart |
| --- | --- | --- | --- |
| You write | A Markdown table | A Vega or Vega-Lite spec | A Flint spec |
| Data in the page | The table, under the chart | Only inside the drawing | Only inside the drawing |
| Layout | [Flint](https://github.com/microsoft/flint-chart) | Yours: every mark, encoding, and axis | Flint |
| Chart types | Bars, stacked bars, lines, areas, scatter plots, dumbbells, waterfalls, and pies | Anything Vega draws | Flint's templates |
| Drawn by | Vega | Vega | Vega or ECharts |
| Output | SVG, with no script | SVG, an image, or a Vue component | A Vue component, SVG, or an image |
| Renderers | `@comark/html` | Any for SVG, `@comark/vue` for the component | Any for SVG, `@comark/vue` for the component |
| Marks on data | [comark-annotate](/annotate/)'s marks and notes | Drawn into the spec | No |
| Data from frontmatter | No | `:spec` bindings | `:spec` bindings |
| Problems | One sentence each in `meta.issues`, saying how to fix it | A `<pre>` with the error in place of the chart | A `<pre>` with the error in place of the chart |
| Cloudflare Workers | Yes | Its SVG lets Vega compile expressions with `new Function`, which Workers block | The same, for its Vega SVG |

## Which to use

Use comark-charts for documents that agents write or check, such as pull request evidence and reports: the table is the source, and it stays in the page. It draws the common chart types and nothing else.

Use [comark-vega](https://github.com/miguelrk/comark-packages/tree/main/packages/comark-vega) for charts those types don't cover, such as box plots, maps, and error bands, or for interactive charts in a Vue app.

Use [comark-flint-chart](https://github.com/miguelrk/comark-packages/tree/main/packages/comark-flint-chart) for Flint's layouts in a Vue app, or for charts drawn with ECharts.

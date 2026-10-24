---
title: comark-code-notes
description: Numbered notes on lines of code, written as comments and a list.
keywords: code annotations, annotated code, callouts, conums, line notes, code comments, AsciiDoc callouts
tagline: End a line of code with a numbered comment like `// <1>`, write the notes as a numbered list under the fence, and each marker links to its note and back.
install: pnpm add comark @comark/html comark-code-notes
group: Review blocks
icon: message-square-code
blurb: Numbered notes on code lines
credits: 'After <a href="https://quarto.org/docs/authoring/code-annotation.html">Quarto</a>''s code annotation and <a href="https://docs.asciidoctor.org/asciidoc/latest/verbatim/callouts/">AsciiDoc</a>''s callouts.'
---

::examples
:::example{label="TypeScript"}
````md
```ts [src/pigeons.ts]
export async function countPigeons(plaza: string) {
  const res = await fetch(`/api/plazas/${plaza}/pigeons`) // <1>
  if (!res.ok) return 0 // <2>
  return (await res.json()).length
}
```

1. One request per plaza, so the map loads the counts in parallel.
2. A plaza the census hasn't reached yet counts as empty instead of failing the page.
````
:::

:::example{label="Python"}
````md
```py
ducks = load("pond.csv")  # <1>
ducks = ducks[ducks.seen > 0]  # <2>
```

1. The census, one row per duck.
2. Drop the ducks nobody has seen this year.
````
:::
::

A reviewer reads a change line by line, and a note beside the line it explains is easier to follow than a paragraph above the block. The markers come from comments, so the code stays valid and copies clean, and the notes are an ordinary Markdown list that reads fine where the plugin doesn't run.

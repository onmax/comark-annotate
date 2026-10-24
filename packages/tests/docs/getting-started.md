---
title: Getting started
description: Install comark-tests, register it, and have your runner write JUnit XML.
install: pnpm add comark @comark/html comark-tests
---

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import tests, { components } from "comark-tests/html";

const render = createHtmlRenderer({ plugins: [tests({ root: "." })], components });
```

`root` is the folder `src` can't leave, and `base` the document's folder under it, as in [comark-include](/include/). In a browser or an edge runtime, pass `read`, a function that takes a path under the root and returns the file's text.

The renderer inlines the styles once per document, and the output needs no script. For Vue, React, or Svelte, import from `comark-tests/vue`, `comark-tests/react`, or `comark-tests/svelte`; the components add the styles when they mount. Import `comark-tests/style.css` with your styles so a server-rendered page doesn't shift. [Renderers](/guide/renderers/) covers using it with other plugins.

## Writing the report

Most runners write JUnit XML with a flag:

| Runner | Command |
| --- | --- |
| Vitest | `vitest run --reporter=junit --outputFile=junit.xml` |
| Jest | `jest --reporters=jest-junit` |
| pytest | `pytest --junitxml=junit.xml` |
| Go | `go test -v ./... 2>&1 \| go-junit-report > junit.xml` |
| Playwright | `PLAYWRIGHT_JUNIT_OUTPUT_NAME=junit.xml playwright test --reporter=junit` |

---
title: comark-tests
description: Test results in Markdown, read from a JUnit report.
keywords: JUnit, test report, test results, Vitest, Jest, Playwright, pytest, CI, XML, failures, stack trace
tagline: Point a block at the JUnit XML your test runner writes and get how many tests passed, failed, and were skipped, how long they took, and every failure with its stack.
install: pnpm add comark @comark/html comark-tests
group: Review blocks
icon: test-tube-diagonal
blurb: Results from a JUnit report
credits: 'Reads the <a href="https://github.com/testmoapp/junitxml">JUnit XML</a> format that Vitest, Jest, pytest, Go, and most CI tools write.'
---

::examples
:::example{label="Failing run"}
````md
::tests{title="Pond census tests"}
```xml
<testsuites time="4.21">
  <testsuite name="pond.test.ts">
    <testcase classname="pond.test.ts" name="counts the ducks" time="0.01"/>
    <testcase classname="pond.test.ts" name="counts the geese" time="0.02">
      <failure message="expected 3 to be 4">AssertionError: expected 3 to be 4
    at pond.test.ts:12:20</failure>
    </testcase>
    <testcase classname="pond.test.ts" name="maps the herons"><skipped/></testcase>
  </testsuite>
</testsuites>
```
::
````
:::

:::example{label="Passing run"}
````md
::tests{title="Pigeon map tests"}
```xml
<testsuite time="1.8">
  <testcase name="draws the plaza"/>
  <testcase name="pins each pigeon"/>
  <testcase name="clusters the flock"/>
</testsuite>
```
::
````
:::
::

A pull request that says the tests pass reads better with the run next to it. The plugin reads the report while parsing, so the page shows the counts with no script, and each failure opens to its message and stack.

---
title: Syntax
description: Reading a report from a file or a fence, and what the summary shows.
---

## From a file

```md
::tests{src="reports/junit.xml" title="Unit tests"}
::
```

`src` is a path relative to the document's folder, or to `root` when it starts with `/`. It can't leave `root` or be a URL.

## From a fence

Paste the report into an ` ```xml ` fence inside the block:

````md
::tests
```xml
<testsuite><testcase name="counts the ducks"/></testsuite>
```
::
````

## Props

| Prop | What it does |
| --- | --- |
| `src` | The JUnit XML file to read. |
| `title` | Shown before the counts, and names the results for screen readers. |

## What it shows

- **Passed, failed, and skipped.** Counted from the `<testcase>` elements, so the totals always match the cases. A case with `<failure>` or `<error>` failed, and one with `<skipped>` was skipped. Failed and skipped show only when there are any.
- **Duration.** The `time` of `<testsuites>`, else the sum of the suites', else the sum of the cases', as `250 ms`, `4.2 s`, or `1 min 21 s`.
- **Failures.** Each one is a `<details>` named `classname › name`, with the failure's `message` and its stack in a code block. With [comark-code](/code/), the stack gets a Copy button.

The root can be `<testsuites>` or a single `<testsuite>`.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a missing `src`, a prop it doesn't read, a file that's missing, outside the root, or a URL, XML that isn't well-formed (with the line), and a document that isn't a JUnit report. The block renders nothing then. Each issue names the block and says how to fix it, and each has its own rule in [Doctor](/doctor/):

```txt
`::tests` 1 ("junit.xml"): its XML is malformed at line 3: `</testsuite>` closes `<testcase>`. Fix the report, or run the tests again to rewrite it.
`::tests` 2: it isn't a JUnit report: its root is `<coverage>`, not `<testsuites>` or `<testsuite>`.
```

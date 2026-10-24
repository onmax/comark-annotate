---
title: Lessons
description: A short lesson that teaches one thing, cites its sources, then has the reader practice and recall it.
---

## A lesson

A lesson teaches one thing, then has the reader use it right away. This one explains why `await` doesn't let a page paint, with numbered [steps](/steps/), a [callout](/github/), and [citations](/sources/), then checks it with a question and a recall card:

::examples
:::example{label="Lesson"}
```md
A promise callback never runs in the middle of other code. It waits in the microtask queue :cite[1], and the browser empties that queue at a fixed point in each turn of the event loop.

::steps
### A task runs
The current script, or one event handler, runs to its end.

### Microtasks run
Every queued promise callback runs, and so do the ones they queue :cite[1].

### The page may paint
Only now can the browser render, then take the next task :cite[2].
::

> [!TIP]
> A long chain of microtasks keeps the page from painting just like one long task does.

::question{#lesson-paint}
Which line lets the browser paint before the rest of the work runs?

- [x] `await new Promise((r) => setTimeout(r))`
  > The timer's callback is a new task, so the page can paint before it.
- [ ] `await Promise.resolve()`
  > It queues a microtask, and microtasks all run before the page paints.
- [ ] `queueMicrotask(() => next())`
  > A microtask still runs before the browser takes its turn to paint.

#explain
Only a new task gives the browser a turn to paint. Microtasks, however many, run first.
::

::recall{#lesson-drain}
When does the browser run the microtask queue?

#answer
After every task, before it renders or takes the next task :cite[1].
::

::sources
1. [Using microtasks in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
2. [Event loops in the HTML standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
::
```
:::
::

## Writing the questions

- **Knowledge first, then practice.** Explain the one idea with sources, then ask about it while it's fresh. A recall card near the end asks for it again from memory, which is what makes it stick.
- **Give every wrong option a reason.** The reason is the lesson for a reader who picked it, so say what that option gets wrong, not only that it's wrong.
- **Make the options look alike.** Keep them about as long as each other and in the same form, so the right one doesn't stand out. The plugin reports a right option that's much longer than the rest.
- **Don't point at other options.** The options are shuffled, so "All of the above" or "Both A and B" stops making sense. Write out what you mean.
- **Give each block an id.** Answers are saved by id, so a lesson you edit keeps its readers' answers. Keep the id when you reword the prompt.
- **Cite the claims.** comark-sources' `:cite` works in prompts, options, reasons, and answers.

## Hosting

Opened as a file, a lesson keeps the reader's answers in their browser. In [Drop](https://drop.vitehub.dev), answers follow the reader across devices, polls collect votes, and each question shows how everyone answered. Any other host can do the same through the events in [Getting started](/quiz/getting-started/#saving-answers).

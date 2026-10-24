---
title: comark-quiz
description: Questions, polls, and recall cards for lessons written in Markdown.
tagline: Write a question as a task list with a reason under each option, and readers check their answer and see why. Polls collect votes, and recall cards hide an answer until the reader asks. All of it reads without a script.
install: pnpm add comark @comark/html comark-quiz
group: Docs blocks
icon: graduation-cap
blurb: Questions, polls, and recall cards
credits: 'For lessons in the style of <a href="https://github.com/mattpocock/skills/tree/main/skills/productivity/teach">Matt Pocock''s teach skill</a>.'
---

::examples
:::example{label="Question"}
```md
::question{#event-loop-order}
Which callback runs first once the current script ends?

- [x] A resolved promise's `then` callback
  > Promise callbacks are microtasks, and the microtask queue empties before the next task.
- [ ] A `setTimeout(fn, 0)` callback
  > A timer queues a task, which waits until the microtask queue is empty.
- [ ] A `requestAnimationFrame` callback
  > It runs before the next paint, after the tasks already queued.

#hint
Two queues are involved. Which one empties first?

#explain
After every task, the event loop runs each queued microtask before it takes the next task, so a promise callback beats a zero-delay timer.
::
```
:::

:::example{label="Poll"}
```md
::poll{#next-lesson}
What should the next lesson cover?

- [ ] Web Workers
- [ ] The `scheduler.yield()` API
- [ ] Streams and backpressure
::
```
:::

:::example{label="Recall"}
```md
::recall{#why-microtasks}
Why does a promise callback run before a zero-delay timer?

#answer
Promise callbacks are microtasks. The event loop empties the microtask queue after every task, before it takes the next one, and a timer's callback is a task.
::
```
:::
::

Pick an option and press Check. A right answer shows its reason and the explanation; a wrong one shows why it's wrong, with Try again and Show answer. The options are shuffled the same way for every reader, and each one gets a key from its text, so an answer saved today still matches after the author reorders them.

A poll needs a host that collects votes, such as [Drop](https://drop.vitehub.dev): without one, its options show disabled. Once a host sends results, a question shows how every reader answered and a poll shows its results the way a social network does. A recall card blurs its answer until the reader asks for it, then asks whether they knew it.

Questions and recall cards share one count, so a lesson numbers them 1, 2, 3 down the page. Every block is open on the page as the reader scrolls. Without the script, the options are a plain list and the answer sits in a Show answer disclosure.

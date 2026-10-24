---
title: Syntax
description: The question, poll, and recall blocks, their props, and their slots.
---

## Question

```md
::question{#event-loop-order}
Which callback runs first once the current script ends?

- [x] A resolved promise's `then` callback
  > Promise callbacks are microtasks. :cite[1]
- [ ] A `setTimeout(fn, 0)` callback
  > A timer queues a task, which waits for the microtasks.

#hint
Two queues are involved.

#explain
After every task, the event loop empties the microtask queue.
::
```

The prompt is everything before the options, and can hold any Markdown, code blocks included. The options are a task list: `- [x]` for a right one and `- [ ]` for a wrong one. One right option makes radios; several, or `multiple`, make checkboxes, and with `multiple` the control doesn't tell how many are right.

Under each option, a `>` line says why it's right or wrong. The reader sees it after checking that option, and every one after Show answer. An option and its reason can hold inline code, links, images, and citations.

| Prop | |
| --- | --- |
| `#id` | The block's id, which a host saves answers by. Without one, the id is a hash of the prompt and options, so it changes when they do. |
| `multiple` | Checkboxes, even with one right option. |
| `number` | `number="false"` leaves the block out of the count. |
| `shuffle` | `shuffle="false"` keeps the order you wrote, for options such as a scale. |

| Slot | |
| --- | --- |
| `#hint` | Behind a Hint button, for a reader who's stuck. |
| `#explain` | Opens after a right answer or Show answer. |

## Poll

```md
::poll{#next-lesson closes="2026-11-30"}
What should the next lesson cover?

- [ ] Web Workers
- [ ] Streams and backpressure
::
```

A poll has the same options with none marked, and no Check button: picking an option is the vote. It keeps the order you wrote. Its results show once the reader votes, and the vote can change until voting closes.

| Prop | |
| --- | --- |
| `#id` | The block's id, as for a question. |
| `multiple` | Checkboxes, with percentages over voters. |
| `closes` | An ISO date. After it, the poll shows as closed. |

## Recall

```md
::recall{#why-microtasks}
Why does a promise callback run before a zero-delay timer?

#answer
Promise callbacks are microtasks, and a timer's callback is a task.
::
```

The `#answer` stays blurred until the reader presses Show answer, then I knew it and Not yet record how it went. Its props are `#id` and `number`.

## Order and keys

A question's options are shuffled with a seed from its id and its options' text, so every reader, and the page without its script, sees one order. Writing them in another order doesn't change it. Each option's key is a hash of its text, so a saved answer still matches after the options move, and stops matching when an option's words change.

Questions and recall cards are numbered in the order they appear. Polls aren't numbered.

## Problems

The plugin adds each problem to `meta.issues`, as [Validation](/guide/validation/) describes, and each kind has its own rule in [Doctor](/doctor/):

- a question with no `[x]`, or a poll with one
- a recall card with no `#answer`
- a block with no `#id`, or one another block has
- a right option much longer than the others, which gives it away
- an option such as "All of the above" that points at other options by place, which the shuffle breaks
- a wrong option with no `>` reason
- an option that runs onto a second line, usually a reason missing its `>`
- a `#explain` or `#hint` swallowed by the text above it, when the blank line before it is missing
- more than six options
- a prop or slot the block doesn't have, and a block inside another

---
title: Getting started
description: Install comark-quiz, register it, and connect a host that saves answers and collects votes.
install: pnpm add comark @comark/html comark-quiz
---

## Usage

Register the plugin and pass the renderer's `components`:

::usage
```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

```ts
import { createHtmlRenderer } from "@comark/html";
import quiz, { components } from "comark-quiz/html";

const render = createHtmlRenderer({ plugins: [quiz()], components });
```
::

The renderer inlines the styles and a small script once per document. Only the HTML renderer exists: the blocks need the script to check answers, so Vue, React, and Svelte versions would each carry it again. [Renderers](/guide/renderers/) covers using it with other plugins.

## Words

Every word the blocks show is an option, so a host can translate them:

```ts
quiz({ labels: { check: "Comprobar", tryAgain: "Otra vez", showAnswer: "Ver respuesta" } });
```

The labels are `check`, `tryAgain`, `showAnswer`, `hint`, `correct`, `notQuite`, `yourAnswer`, `correctAnswer`, `vote` and `votes` (`"{count} votes"`), `answer` and `answers` (`"{count} answers"`), `changeVote`, `knewIt`, `notYet`, `noHost`, and `closed`.

## Saving answers

With no host, each answer stays in the reader's browser, in `localStorage` under `comark-quiz:<path>:<id>`. In a sandboxed frame, where storage throws or forgets, the blocks still work for the visit.

A host such as [Drop](https://drop.vitehub.dev) keeps the answers instead, and sends back how everyone answered. It talks to the script through events on `document`:

| Event | Sent by | Detail |
| --- | --- | --- |
| `comark-quiz:ready` | The script, once the page's blocks are in, and again for blocks added later | `{ ids: string[] }` |
| `comark-quiz:answer` | Each block, bubbling and crossing shadow roots | `{ id, kind, choice, correct, first }` |
| `comark-quiz:state` | The host | `{ answers?, results?, voting? }` |

An answer's `choice` holds option keys. A question sends one on every Check, and `choice: []` with `correct: false` on Show answer. A poll sends its choice on every vote, with `correct: null`. A recall card sends `["revealed"]`, then `["knew"]` or `["missed"]`. `first` is true for the first answer to a block on a page view.

The state the host sends looks like this:

```ts
document.dispatchEvent(
  new CustomEvent("comark-quiz:state", {
    detail: {
      answers: { "event-loop-order": { choice: ["1x9k2ab"], correct: true } },
      results: { "next-lesson": { counts: { "7ym8b3": 12, "1hxx01f": 30 }, total: 42 } },
      voting: { open: true, notice: "Votes close on Friday" },
    },
  }),
);
```

- **Answers** restore with no motion. An empty `choice` takes an answer back, except a question's `choice: []` with `correct: false`, which is a shown answer. Once the first state arrives, the script stops using `localStorage`.
- **Results** show once the reader has answered: a question's after a right answer or Show answer, a poll's after a vote. A poll with `multiple` counts percentages over voters, so send the number of voters as `total`.
- **Voting** opens polls. With `open: false`, polls show their results and `notice`, and send no votes; questions and recall cards still work.

`window.__comarkQuiz.apply(state)` does the same as the event, for a host that would rather call a function, and `window.__comarkQuiz.ids()` lists the blocks on the page.

The server's HTML carries what a host needs to check a posted answer: `data-quiz-id` and `data-quiz-kind` on each block, `data-key` on each option, and `data-correct` on a question's right options.

---
title: comark-critic
description: CriticMarkup in Markdown, shown as native ins, del, and mark, or accepted or rejected.
keywords: track changes, suggestions, suggest edits, redline, insertions, deletions, comments, proofreading
tagline: Suggest an edit right in the text, comment on a phrase, and render the page with the changes shown, accepted, or rejected.
install: pnpm add comark comark-critic
group: Markdown syntax
icon: file-pen-line
blurb: Suggested edits and comments
credits: 'Syntax from <a href="https://criticmarkup.com">CriticMarkup</a>, and the modes from <a href="https://facelessuser.github.io/pymdown-extensions/extensions/critic/">pymdownx.critic</a>.'
---

::examples
:::example{label="Suggested edits"}
```md
The deploy waits when more than {--twelve--}{++fifteen++} pigeons sit on the roof.

Count them {~~after~>before~~} the stand-up, from the {==east window==}{>>The west one faces the parking lot.<<}.

Pizza is on Friday{>>Pineapple still needs a vote.<<}.
```
:::
::

Insertions render as `<ins>`, deletions as `<del>`, highlights as `<mark>`, and comments as a small muted span. Set `mode` to `accept` or `reject` to render the same Markdown with the changes made or undone.

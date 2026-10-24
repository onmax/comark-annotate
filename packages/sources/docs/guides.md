---
title: Guides
description: Sources in agent-written documents, and theming.
---

## Sources in agent-written documents

An agent that researches a change can cite as it writes and list its links once at the end. The plugin checks what readers can't: every citation points at a source that exists. Reject a document whose `meta.issues` isn't empty, as [Validation](/guide/validation/) describes, and the agent gets back a sentence such as "`:cite` 3 cites source 4, but `::sources` lists 3" to fix it with.

## Theming

Citations and sources read the [shared tokens](/guide/theming/): `--comark-foreground` for links and the title, `--comark-muted` for the list and the markers, `--comark-border` for the rule above the list, `--comark-accent` behind a source just jumped to, `--comark-ring` for focus rings, `--comark-radius` for the corners of both, and `--comark-font`. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

| Class | Element |
| --- | --- |
| `.cso-cite` | A citation's `sup` |
| `.cso` | The sources' `section` |
| `.cso-title` | Its title |
| `.cso-back` | A link back to a citation |

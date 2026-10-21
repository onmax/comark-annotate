---
title: Agents
description: Agent skills served from this site, and the commands an agent uses to check what it wrote.
tagline: Agents write most review documents. Install a skill so yours knows the syntax, then let it check its own work before it hands the document over.
---

## Skills

Packages that need more than their syntax ship an agent skill, and this site serves every one of them through [Agent Skills Discovery](https://agentskills.io), at `/.well-known/agent-skills/index.json`. Install them all:

```sh
npx skills add https://comark.onmax.me
```

Or install one by name, as the **For agents** button on a package's page does:

```sh
npx skills add https://comark.onmax.me --skill comark-annotate
```

| Skill | What it knows |
| --- | --- |
| `comark-annotate` | The screenshot, compare, and diff syntax, how to measure marks from the page instead of guessing them from the image, and how to check the render |

The other packages have no skill. Their syntax fits on their page, and a document that gets it wrong fails [validation](/guide/validation/) with a message that says what to change.

## Check the result

An agent should check a document before it hands it over. comark-linter lists every problem, each with its line:

```sh
npx comark-linter report.md
```

Marks need a look as well as a check: a box can sit inside the image and still miss its target. `comark-annotate render` writes a standalone page next to the file, which the agent opens in a browser and screenshots to confirm each mark sits on its target:

```sh
npx comark-annotate render report.md -o report.html
```

## Writing for reviewers

Agents often write these documents as evidence on a pull request. [A review document](/recipes/review/) shows one put together from several plugins.

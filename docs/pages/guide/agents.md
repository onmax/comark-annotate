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
| `comark-annotate` | The screenshot, compare, and diff syntax, which marks to draw and what their notes say, how to measure marks from the page instead of guessing them from the image, and how to check the render |
| `comark-charts` | The table shape for each chart type, how to pick the type that fits the data, and how to mark the values that matter |

The other packages have no skill. Their syntax fits on their page, and a document that gets it wrong fails [validation](/guide/validation/) with a message that says what to change.

## Bundle a skill in your app

An app that renders these documents and serves skills to its own agents, such as Drop, can ship our skill instead of writing its own. Each package with a skill exports it, so the app imports it at build time:

```ts
import annotateSkill from "comark-annotate/skills/comark-annotate/SKILL.md?raw";
```

The text then always matches the renderer the app installed: an app on an older version never tells its agents about syntax it can't draw yet, and its agents need no network request to read it. Serve it as a skill of its own, or inside one of yours as a reference file with its front matter removed. When it names a CLI command, pin it to the installed version, such as `npx comark-annotate@0.3.0 check`.

## Check the result

An agent should check a document before it hands it over. comark-lint lists every problem, each with its line:

```sh
npx comark-lint report.md
```

Marks need a look as well as a check: a box can sit inside the image and still miss its target. `comark-annotate render` writes a standalone page next to the file, which the agent opens in a browser and screenshots to confirm each mark sits on its target:

```sh
npx comark-annotate render report.md -o report.html
```

## Writing for reviewers

Agents often write these documents as evidence on a pull request. [A review document](/recipes/review/) shows one put together from several plugins. [Sharing a review](/recipes/share/) shows how the agent publishes it to Drop, where reviewers comment on the exact spot and the agent reads their comments.

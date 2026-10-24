---
title: Agents
description: The agent skill served from this site, and the commands an agent uses to check what it wrote.
tagline: Agents write most review documents. Install the skill so yours knows the syntax, then let it check its own work before it hands the document over.
---

## Skill

One agent skill, `comark-plugins`, teaches an agent every package. This site serves it through [Agent Skills Discovery](https://agentskills.io), at `/.well-known/agent-skills/index.json`, and the **For agents** button on a package's page copies the command that installs it:

```sh
npx skills add https://comark.onmax.me
```

Its `SKILL.md` holds what every document needs: how to install the plugins, which block shows what, the marks that screenshots and charts share, and how to check the result. Each package has a reference next to it, with its syntax, how to use it well, and how to register it alone, and the agent reads only the references for the blocks it writes.

## Bundle the skill in your app

An app that renders these documents and serves skills to its own agents, such as Drop, can ship ours instead of writing its own. `@onmax/comark` exports the skill's folder, so the app copies it at build time:

```ts
import { cp } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const skill = dirname(fileURLToPath(import.meta.resolve("@onmax/comark/skills/comark-plugins/SKILL.md")));
await cp(skill, "skills/comark-plugins", { recursive: true });
```

The skill then always matches the renderers the app installed. An app on an older version never tells its agents about syntax it can't draw yet, and its agents read the skill without a network request.

Serve the folder as one skill, with the references under `references/`, where `SKILL.md` links them. If your agents only write Markdown and never install anything, cut each reference at its `## Register` heading, which always comes last. When it names a CLI command, pin the command to the installed version, such as `npx comark-annotate@0.3.0 check`.

## Check the result

An agent should check a document before it hands it over. comark-linter lists every problem, each with its line:

```sh
npx lint-comark duck-audit.md
```

Marks also need a look, because a box can sit inside the image and still miss its target. `comark-annotate render` writes a standalone page next to the file. The agent opens it in a browser and takes a screenshot to confirm each mark sits on its target:

```sh
npx comark-annotate render duck-audit.md -o duck-audit.html
```

## Writing for reviewers

Agents often write these documents as evidence on a pull request. [A review document](/recipes/review/) shows one put together from several plugins. [Sharing a review](/recipes/share/) shows how the agent publishes it to Drop, where reviewers comment on the exact spot and the agent reads their comments.

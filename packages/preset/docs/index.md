---
title: "@onmax/comark"
description: Every comark-ui package in one install.
keywords: all plugins, every plugin, bundle, kit, starter, one import
tagline: onmax's preset, like @antfu/eslint-config for Comark. One import registers every plugin in the order they need, and each release brings their latest defaults.
install: pnpm add comark @comark/html @onmax/comark
group: Comark plugins
icon: boxes
blurb: Every plugin in one install
---

::examples
:::example{label="Everything"}
````md
> [!TIP]
> One import renders every block on this site.

::steps
### Install
:::code-group
```sh [pnpm]
pnpm add comark @comark/html @onmax/comark
```
```sh [npm]
npm install comark @comark/html @onmax/comark
```
:::

### Render
Pass `onmax()` to the renderer.
::
````
:::
::

This site renders every page through the preset.

## Usage

```ts
import { createHtmlRenderer } from "@comark/html";
import onmax from "@onmax/comark/html";

const render = createHtmlRenderer(onmax());
```

`onmax()` returns the `plugins` and `components` for one renderer. Import it from `@onmax/comark/html`, `/vue`, `/react`, or `/svelte`. The Vue, React, and Svelte entries leave out [annotate](/annotate/) and [diff](/diff/), which render only to HTML.

## Options

Every plugin is on except [include](/include/), which reads files from disk. Pass `false` to turn a plugin off, which drops its components too, or an object to pass it options:

```ts
onmax({
  zoom: false,
  code: { actions: [{ id: "run", label: "Run" }] },
  github: { callouts: false, references: { repo: "owner/name" } },
  table: { root: "data" },
  include: { root: "content" },
});
```

The keys are the packages' names without `comark-`, in camelCase: `fileTree`, `codeNotes`, `readingTime`. `github` takes its three plugins by name, `callouts`, `references`, and `html`, and `links` takes `external` and `anchors`.

[cast](/cast/), [table](/table/), and [tests](/tests/) read files from disk on their own, so the preset gives them a reader that finds none: inline casts, CSV fences, and pasted reports still render. Pass `{ root }` to read files under a folder, or `{ read }` to read them yourself. [diagrams](/diagrams/) sends each diagram's source to `https://kroki.io` unless you pass your own `server`.

The icon resolver from `icon`'s options also draws the icons of cards, details, file trees, tabs, and code actions, so its `collections` and `fetch` apply to all of them. When you parse in a browser, pass `chips: { download: false }`, since a browser may not download another site's images.

[critic](/critic/) has no component to add its styles, so put `criticCss`, exported by every entry, in the page.

## Agents

The package ships the comark-ui agent skill. [Agents](/guide/agents/) shows how to install it, or bundle it in an app so it always matches the plugins the app installed.

## Versions

The preset ships in lockstep with the plugins, so `@onmax/comark@X` holds every plugin at version `X`. [comark-linter](/lint/) finds the preset when it's installed and checks documents with its plugins.

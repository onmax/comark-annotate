---
title: comark-embed
description: Videos, audio, and live code from a link, written in Markdown.
tagline: Paste a YouTube, Vimeo, Loom, Spotify, CodePen, StackBlitz, or Figma link and get its player, with the link under it. Nothing is fetched.
install: pnpm add comark @comark/html comark-embed
---

::tabs
:::example{label="Video"}
```md
::embed{url="https://www.youtube.com/watch?v=KCrXgy8qtjM" title="Vite in 100 Seconds"}
::
```
:::

:::example{label="Live code"}
```md
::embed{url="https://stackblitz.com/edit/vitejs-vite?file=index.html" title="A Vite starter on StackBlitz"}
::
```
:::

:::example{label="Link card"}
```md
::embed{url="https://comark.dev" title="Comark, Markdown with components"}
::
```
:::
::

The plugin reads the player's address from the link alone, so a document renders the same offline, in tests, and at build time. The link stays under every player, so the page still makes sense in a feed reader or where iframes are blocked, and in print each player gives way to its address.

## Usage

Register the plugin and pass the renderer's `components`:

```ts
import { createHtmlRenderer } from "@comark/html";
import embed, { components } from "comark-embed/html";

const render = createHtmlRenderer({ plugins: [embed()], components });
```

## Syntax

```md
::embed{url="https://youtu.be/KCrXgy8qtjM" title="Vite in 100 Seconds" start=30}
::
```

Close the block with `::` on the next line; anything inside it is dropped.

| Prop | What it does |
| --- | --- |
| `url` | Required. An `https://` link. |
| `title` | Names the player for screen readers and is the text of the link under it. Without it the link shows the host. |
| `start` | Seconds into a YouTube or Vimeo video to start at. A YouTube link's own `t=` works too. |

| Provider | Links it reads | Player |
| --- | --- | --- |
| YouTube | `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/` | YouTube's privacy-enhanced mode, `youtube-nocookie.com`. Shorts are tall. |
| Vimeo | `vimeo.com/<number>`, unlisted links with their hash, `player.vimeo.com/video/` | With `dnt=1`, so Vimeo doesn't track the session. |
| Loom | `loom.com/share/<id>` | Loom's embed player. |
| Spotify | `open.spotify.com/` track, album, playlist, episode, show, and artist links | A compact player for a track or an episode, a full one for the rest. |
| CodePen | `codepen.io/<user>/pen/<id>` | The pen's result. |
| StackBlitz | `stackblitz.com/edit/<project>`, `stackblitz.com/github/<owner>/<repo>` | The project, keeping options such as `file` and `view`. |
| Figma | `figma.com/design`, `proto`, `board`, `slides`, and `deck` links | Figma's embed, keeping `node-id`. |

Any other `https://` link renders as a card with its `title` and host. Cards don't fetch the page's title yet, so give each one a `title`.

The plugin adds every problem to `meta.issues`, so a host can reject a document before publishing it: a missing `url`, one that isn't `https://` (it renders nothing), a provider's link it can't read an ID from (it renders as a card), a card without a `title`, a `start` that isn't whole seconds or is set on a player that can't seek, and content inside the block. Each issue names its block and says how to fix it.

## Guides

### Theming

Players sit in a bordered frame with their link under it, and cards follow shadcn/ui's Item: a globe, the title, and the host. Both read shadcn/ui's variables, such as `--background`, `--border`, and `--muted-foreground`, when the page has them, and use its neutral theme otherwise; the shared `--comark-*` tokens theme them together with the other plugins. Override `--ce-app-height` to change the height of CodePen, StackBlitz, and Figma:

```css
.ce {
  --ce-app-height: 40rem;
}
```

The rules sit in a `comark` CSS layer, so any plain rule of your own wins. A player is a `figure.ce` with `data-provider` and `data-size`, holding `.ce-frame` and a `figcaption`; a card is an `a.ce-card`.

### Renderers

The same markup comes out of every renderer. Import the components from the entry for yours:

| Renderer | Import |
| --- | --- |
| `@comark/html` | `comark-embed/html` inlines the styles once per document |
| `@comark/vue` | `comark-embed/vue` |
| `@comark/react` | `comark-embed/react` |
| `@comark/svelte` | `comark-embed/svelte` |

The Vue, React, and Svelte components add the styles when they mount. Import `comark-embed/style.css` with your styles so a server-rendered page doesn't shift.

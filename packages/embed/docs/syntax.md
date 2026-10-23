---
title: Syntax
description: The links embed reads and its props.
---

```md
::embed{url="https://youtu.be/KCrXgy8qtjM" title="Watch before standup: Vite in 100 Seconds" start=30}
::
```

Close the block with `::` on the next line. The plugin drops anything inside it.

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

A StackBlitz project that runs in WebContainers, such as a Node or Vite starter, needs a cross-origin-isolated page and a supported browser. Without them, its preview may fail with "Unable to run Embedded Project". StackBlitz lists the [supported browsers](https://developer.stackblitz.com/platform/webcontainers/browser-support) and the [browser configuration](https://developer.stackblitz.com/platform/webcontainers/browser-config).

A project that runs in the browser alone, such as the `typescript` starter, doesn't need that isolation. It still needs one of StackBlitz's [supported embedding environments](https://developer.stackblitz.com/guides/integration/embedding).

Any other `https://` link renders as a card with its `title` and host. Cards don't fetch the page's title yet, so give each one a `title`.

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes:

- A missing `url`.
- A `url` that isn't `https://`. The block renders nothing.
- A provider's link it can't read an ID from. The block renders as a card.
- A card without a `title`.
- A `start` that isn't whole seconds, or that is set on a player that can't seek.
- Content inside the block.

Each issue names its block and says how to fix it.

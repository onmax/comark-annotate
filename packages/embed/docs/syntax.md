---
title: Syntax
description: The links embed reads and its props.
---

```md
::embed{url="https://youtu.be/KCrXgy8qtjM" title="Watch before standup: Vite in 100 Seconds" start=30}
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

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a missing `url`, one that isn't `https://` (it renders nothing), a provider's link it can't read an ID from (it renders as a card), a card without a `title`, a `start` that isn't whole seconds or is set on a player that can't seek, and content inside the block. Each issue names its block and says how to fix it.

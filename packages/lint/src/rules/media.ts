import type { RuleInfo } from "./types.ts";

// comark-media's issues, COMARK1501 on.
export default {
  "comark/media/invalid-src": { code: "COMARK1501", title: "Use a playable media file extension" },
  "comark/media/missing-label": { code: "COMARK1502", title: "Describe every media file" },
  "comark/media/audio-poster": { code: "COMARK1503", title: "Remove `poster` from audio" },
  "comark/media/autoplay-unmuted": { code: "COMARK1504", title: "Mute media that autoplays" },
  "comark/media/unknown-prop": { code: "COMARK1505", title: "Use only media options" },
} satisfies Record<`comark/media/${string}`, RuleInfo>;

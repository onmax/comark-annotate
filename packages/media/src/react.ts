import { createElement, useEffect } from "react";
import { addStyles } from "./client.ts";
import type { MediaAttributes } from "./index.ts";

export { default } from "./index.ts";
export type { MediaAttributes, MediaMeta } from "./index.ts";

/** Videos and audio for `@comark/react`. */
export function Media({ kind, src, label, poster, autoplay, loop, muted }: MediaAttributes) {
  useEffect(addStyles, []);
  if ((kind !== "video" && kind !== "audio") || !src) return null;
  const video = kind === "video";
  return createElement(
    kind,
    {
      className: "cm",
      src,
      controls: true,
      playsInline: video || undefined,
      preload: "metadata",
      poster: video ? poster : undefined,
      autoPlay: autoplay || undefined,
      loop: loop || undefined,
      muted: muted || undefined,
      "aria-label": label || undefined,
    },
    createElement("a", { href: src }, label || src),
  );
}

/** Pass these as `components` to `@comark/react`. */
export const components = { Media };

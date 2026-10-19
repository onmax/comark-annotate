import { createElement, type ReactNode, useEffect } from "react";
import { css, start } from "./client.ts";

export { default, RUNTIME_TAG } from "./index.ts";
export type { ZoomOptions } from "./index.ts";
export type { ZoomDetail } from "./client.ts";

/** `::zoom` for `@comark/react`. */
export function Zoom({
  group,
  title,
  children,
}: {
  group?: string;
  title?: string;
  children?: ReactNode;
}) {
  useEffect(() => start(css), []);
  return createElement(
    "div",
    {
      className: "cz",
      "data-zoom": "",
      tabIndex: 0,
      "data-zoom-group": group,
      "data-zoom-title": title,
    },
    children,
  );
}

/** Starts the zoom script for zoomable images. The plugin adds it to documents that need it. */
export function ZoomRuntime() {
  useEffect(() => start(css), []);
  return null;
}

/** Pass these as `components` to `@comark/react`. */
export const components = { Zoom, ZoomRuntime };

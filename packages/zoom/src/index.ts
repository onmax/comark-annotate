import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";

export interface ZoomOptions {
  /** Make every content image zoomable. Images inside links keep their link. Default `true`. */
  images?: boolean;
}

/** The node that starts the zoom script. The plugin adds one at the end of a document that has anything to zoom. */
export const RUNTIME_TAG = "zoom-runtime";

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;

// Marks images with the same attributes a `::zoom` block gets, so every renderer outputs zoomable images unchanged.
function mark(nodes: Node[], images: boolean, inLink = false): boolean {
  let found = false;
  for (const node of nodes) {
    if (!isElement(node)) continue;
    const [tag, attrs] = node;
    if (tag === "zoom") found = true;
    if (tag === "img" && images && !inLink && attrs["data-zoom"] === undefined) {
      attrs["data-zoom"] = "";
      attrs.tabindex = "0";
      found = true;
    }
    // SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
    if (mark(node.slice(2) as Node[], images, inLink || tag === "a")) found = true;
  }
  return found;
}

/**
 * Zooms images and `::zoom` blocks like medium-zoom: out of their place on the page, closed with Escape, Back, or a
 * click around them. Items with the same `group` page through one zoomed view with a strip of them at the bottom.
 */
export default defineComarkPlugin<ZoomOptions>((options) => ({
  name: "comark-zoom",
  post(state) {
    const { nodes } = state.tree;
    if (mark(nodes, options?.images ?? true)) nodes.push([RUNTIME_TAG, {}]);
  },
}));

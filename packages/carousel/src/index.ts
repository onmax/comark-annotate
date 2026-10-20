import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const isBlank = (node: Node) => !Array.isArray(node) && node.trim() === "";

// Every renderer gets explicit slides with their position, so none of them has to split rendered children.
function normalize(nodes: Node[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    // SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
    const children = node.slice(2) as Node[];
    normalize(children);
    if (node[0] !== "carousel") continue;
    const content = children.filter((child) => !isBlank(child));
    const slides: ElementNode[] = content.some((child) => isElement(child) && child[0] === "slide")
      ? content.filter((child): child is ElementNode => isElement(child) && child[0] === "slide")
      : content.map((child) => ["slide", {}, child]);
    const zoom = node[1].zoom !== false && node[1].zoom !== "false";
    for (const [index, slide] of slides.entries()) {
      slide[1].index = String(index + 1);
      slide[1].count = String(slides.length);
      if (!zoom) slide[1].zoom = "false";
    }
    node[1].count = String(slides.length);
    node.splice(2, node.length - 2, ...slides);
  }
}

/**
 * Turns `::carousel` into slides: every block inside it, or every `:::slide` when there are any. Slides scroll and
 * snap without a script; the script adds arrows, a counter, and keys, and zooms a slide with the others in a strip.
 */
export default defineComarkPlugin(() => ({
  name: "comark-carousel",
  post(state) {
    normalize(state.tree.nodes);
  },
}));

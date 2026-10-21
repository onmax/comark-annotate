import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import type { ActionButton } from "./client.ts";

export type CodeAction = {
  /** Sent as `detail.action` with the `comark-code-action` event. */
  id: string;
  /** The button's text. */
  label: string;
  /** The languages of the code blocks that get the button, such as `["sh", "bash"]`. Every code block when left out. */
  languages?: string[];
};

export type CodeOptions = {
  /** Buttons of your own, before Wrap and Copy. A click sends the block's code to the page in an event. */
  actions?: CodeAction[];
};

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
// SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
const childrenOf = (node: ElementNode) => node.slice(2) as Node[];

function mark(nodes: Node[], actions: CodeAction[]) {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node[0] === "pre") {
      // SAFETY: Comark writes a fence's language as a string, and leaves it out when the fence has none.
      const language = ((node[1].language as string | undefined) ?? "").toLowerCase();
      const matched = actions.filter(
        (action) =>
          !action.languages ||
          action.languages.some((name) => name.toLowerCase() === language && language),
      );
      if (matched.length)
        node[1].actions = matched.map(({ id, label }): ActionButton => ({ id, label }));
      continue;
    }
    mark(childrenOf(node), actions);
  }
}

/**
 * Puts your own buttons on code blocks, by language. Copy and Wrap come from the renderer's components alone; this
 * plugin is what tells every renderer which blocks get which of your actions.
 */
export default defineComarkPlugin<CodeOptions>((options) => ({
  name: "comark-code",
  post(state) {
    const actions = options?.actions ?? [];
    if (actions.length) mark(state.tree.nodes, actions);
  },
}));

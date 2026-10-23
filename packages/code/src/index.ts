import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import { createIcons, describeIconProblem, iconProblemRule, type Icons } from "comark-icon";
import type { ActionButton } from "./client.ts";

type Shown =
  | {
      /** The button's text. */
      label: string;
      /** An Iconify name, such as `lucide:play`, or an image URL, drawn before the label. */
      icon?: string;
    }
  | {
      label?: undefined;
      /** An Iconify name, such as `lucide:play`, or an image URL. With no `label`, the button shows only the icon. */
      icon: string;
      /** What an icon-only button is called: its tooltip, and the name screen readers read. */
      title: string;
    };

/** A button of yours: a label, an icon, or both. */
export type CodeAction = Shown & {
  /** Sent as `detail.action` with the `comark-code-action` event, and what `onCodeAction()` listens for. */
  id: string;
  /** The tooltip. The label by default. */
  title?: string;
  /** The languages of the code blocks that get the button, such as `["sh", "bash"]`. Every code block when left out. */
  languages?: string[];
};

export type CodeOptions = {
  /** Buttons of your own, before Wrap and Copy. A click sends the block's code to the page in an event. */
  actions?: CodeAction[];
  /**
   * Resolves the actions' icons, from `createIcons()` in comark-icon. Pass the one the page's other plugins use, so they
   * share its `collections` and `fetch`. By default icons come from the Iconify API.
   */
  iconResolver?: Icons;
};

export type CodeMeta = {
  /** One readable sentence per action whose icon can't be drawn. Other plugins add theirs too. */
  issues: string[];
  /** The comark-linter rule of each issue, by its sentence, so the linter reports it under its own code. */
  issueRules: Record<string, string>;
};

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
// SAFETY: an element node is [tag, attributes, ...children], so everything after index 1 is a child node.
const childrenOf = (node: ElementNode) => node.slice(2) as Node[];

function mark(nodes: Node[], actions: CodeAction[], used: Set<CodeAction>, blocks: ElementNode[]) {
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
      if (matched.length) {
        for (const action of matched) used.add(action);
        node[1].actions = matched;
        blocks.push(node);
      }
      continue;
    }
    mark(childrenOf(node), actions, used, blocks);
  }
}

/**
 * Puts your own buttons on code blocks, by language. Copy and Wrap come from the renderer's components alone; this
 * plugin is what tells every renderer which blocks get which of your actions. An icon it can't draw is added to
 * `meta.issues`, and its button shows the title instead.
 */
export default defineComarkPlugin<CodeOptions, CodeMeta>((options = {}) => {
  const resolver = options.iconResolver ?? createIcons();
  return {
    name: "comark-code",
    async post(state) {
      const actions = options.actions ?? [];
      if (!actions.length) return;
      const used = new Set<CodeAction>();
      const blocks: ElementNode[] = [];
      mark(state.tree.nodes, actions, used, blocks);
      const icons = [...used].flatMap((action) => (action.icon ? [action.icon] : []));
      const resolved = icons.length ? await resolver.resolve(icons) : new Map();
      const issues: { rule: string; message: string }[] = [];
      const buttons = new Map<CodeAction, ActionButton>();
      for (const action of used) {
        const title = action.title || action.label || action.id;
        const icon = action.icon ? resolved.get(action.icon) : undefined;
        if (action.icon && icon && "problem" in icon)
          issues.push({
            rule: iconProblemRule(icon),
            message: `The comark-code action "${action.id}" shows "${title}" as text on its code blocks, because it can't draw its icon "${action.icon}": ${describeIconProblem(action.icon, icon)}`,
          });
        const drawn = icon && !("problem" in icon) ? icon : undefined;
        buttons.set(action, {
          id: action.id,
          label: action.label || (drawn ? "" : title),
          title,
          ...(drawn && { icon: { src: drawn.src, ratio: drawn.ratio, mask: drawn.mask } }),
        });
      }
      for (const block of blocks)
        // SAFETY: `mark` wrote the matched actions on every block it pushed.
        block[1].actions = (block[1].actions as CodeAction[]).map((action) => buttons.get(action));
      if (!issues.length) return;
      const { meta } = state.tree;
      meta.issues = [...(meta.issues ?? []), ...issues.map((issue) => issue.message)];
      meta.issueRules = {
        ...meta.issueRules,
        ...Object.fromEntries(issues.map((issue) => [issue.message, issue.rule])),
      };
    },
  };
});

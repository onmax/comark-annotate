import type { ElementNode, Node } from "comark";
import { defineComarkPlugin } from "comark";
import { readChart } from "./read.ts";

export type { Chart, ChartType, XKind } from "./read.ts";

export type ChartsMeta = {
  /** One readable sentence per problem with a `::chart`. Other plugins add theirs too. */
  issues: string[];
};

const isElement = (node: Node): node is ElementNode => Array.isArray(node) && node[0] !== null;
const childrenOf = ([, , ...rest]: ElementNode): Node[] => rest;

/** Calls `visit` on every `::chart` node in document order, with its number. */
export function eachChart(nodes: Node[], visit: (node: ElementNode, number: number) => void) {
  let count = 0;
  const walk = (children: Node[]) => {
    for (const node of children) {
      if (!isElement(node)) continue;
      if (node[0] === "chart") visit(node, ++count);
      else walk(childrenOf(node));
    }
  };
  walk(nodes);
}

/**
 * Checks every `::chart`: its props, and the Markdown table it draws. Problems are added to `meta.issues`. The
 * renderer reads the same table, so the parse tree keeps the data and the chart is drawn only when rendering.
 */
export default defineComarkPlugin<void, ChartsMeta>(() => ({
  name: "comark-charts",
  post(state) {
    const { tree } = state;
    const issues: string[] = [];
    eachChart(tree.nodes, (node, number) => readChart(node, number, issues));
    tree.meta.issues = [...(tree.meta.issues ?? []), ...issues];
  },
}));

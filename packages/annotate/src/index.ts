import { defineComarkPlugin } from "comark";
import { check } from "./read.ts";

export type { Mark } from "./marks.ts";

export type AnnotateMeta = {
  /** One readable sentence per problem with a `::screenshot`, `::compare`, or `::annotation`. Empty when the document is valid. */
  annotateIssues: string[];
};

/**
 * Checks `::screenshot`, `::compare`, and `::annotation` blocks while parsing and lists every problem in
 * `meta.annotateIssues`, so a host can reject a document before publishing it. Rendering does not depend on it.
 */
export default defineComarkPlugin<void, AnnotateMeta>(() => ({
  name: "comark-annotate",
  post(state) {
    const { tree } = state;
    tree.meta.annotateIssues = check(tree.nodes, {
      frontmatter: tree.frontmatter,
      meta: tree.meta,
      data: {},
      props: {},
    });
  },
}));

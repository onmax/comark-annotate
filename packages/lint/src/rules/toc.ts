import type { RuleInfo } from "./types.ts";

// comark-toc's issues, COMARK2501 on.
export default {
  "comark/toc/content-dropped": { code: "COMARK2501", title: "Keep content out of `::toc`" },
  "comark/toc/invalid-depth": {
    code: "COMARK2502",
    title: "Write `depth` as a whole number from 2 to 6",
  },
  "comark/toc/no-headings": { code: "COMARK2503", title: "Give a `::toc` headings to list" },
  "comark/toc/unknown-prop": { code: "COMARK2504", title: "Use only `::toc`'s props" },
} satisfies Record<`comark/toc/${string}`, RuleInfo>;

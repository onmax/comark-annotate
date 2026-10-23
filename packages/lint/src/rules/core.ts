import type { RuleInfo } from "./types.ts";

export default {
  "comark/unclosed-block": { code: "COMARK0001", title: "Close every `::` block" },
  "comark/unknown-component": { code: "COMARK0002", title: "Use only known components" },
  "comark/malformed-attributes": {
    code: "COMARK0003",
    title: "Close `{` attributes and set each key once",
  },
  "comark/broken-anchor": {
    code: "COMARK0004",
    title: "Link `#fragments` to a heading or id in the document",
  },
  "comark/invalid-frontmatter": {
    code: "COMARK0005",
    title: "Write valid YAML frontmatter",
    severity: "error",
  },
  "comark/plugin-issue": { code: "COMARK0006", title: "Fix the problems Comark plugins report" },
  "comark/unsafe-url": {
    code: "COMARK0007",
    title: "Keep script URLs out of `href` and `src`",
    severity: "error",
  },
  "comark/duplicate-id": { code: "COMARK0008", title: "Give each element its own id" },
  "comark/missing-alt": { code: "COMARK0009", title: "Describe every image in its alt text" },
  "comark/empty-link": { code: "COMARK0010", title: "Give every link text" },
} satisfies Record<`comark/${string}`, RuleInfo>;

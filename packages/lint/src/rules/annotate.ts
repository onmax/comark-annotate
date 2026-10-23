import type { RuleInfo } from "./types.ts";

// comark-annotate's issues, COMARK0101 on.
export default {} satisfies Record<`comark/annotate/${string}`, RuleInfo>;

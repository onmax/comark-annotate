import type { RuleInfo } from "./types.ts";

// comark-code's issues, COMARK0601 on. Its only issue, an action's icon it can't draw, comes from the plugin's options
// and is reported under comark-icon's rules.
export default {} satisfies Record<`comark/code/${string}`, RuleInfo>;

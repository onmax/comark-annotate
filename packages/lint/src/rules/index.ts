import annotate from "./annotate.ts";
import badge from "./badge.ts";
import cards from "./cards.ts";
import carousel from "./carousel.ts";
import charts from "./charts.ts";
import chips from "./chips.ts";
import code from "./code.ts";
import core from "./core.ts";
import diff from "./diff.ts";
import embed from "./embed.ts";
import github from "./github.ts";
import icon from "./icon.ts";
import include from "./include.ts";
import media from "./media.ts";
import steps from "./steps.ts";
import tabs from "./tabs.ts";
import type { RuleInfo } from "./types.ts";

export type { RuleInfo } from "./types.ts";

// The core rules, then each package's, in the order of their codes' hundreds. A new package takes the next hundred.
export const catalog = {
  ...core,
  ...annotate,
  ...cards,
  ...carousel,
  ...charts,
  ...chips,
  ...code,
  ...diff,
  ...embed,
  ...github,
  ...icon,
  ...include,
  ...steps,
  ...tabs,
  ...badge,
  ...media,
} satisfies Record<string, RuleInfo>;

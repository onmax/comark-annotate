import annotate from "./annotate.ts";
import badge from "./badge.ts";
import cards from "./cards.ts";
import carousel from "./carousel.ts";
import charts from "./charts.ts";
import chips from "./chips.ts";
import code from "./code.ts";
import colors from "./colors.ts";
import core from "./core.ts";
import details from "./details.ts";
import critic from "./critic.ts";
import diff from "./diff.ts";
import embed from "./embed.ts";
import fields from "./fields.ts";
import fileTree from "./file-tree.ts";
import github from "./github.ts";
import icon from "./icon.ts";
import include from "./include.ts";
import media from "./media.ts";
import outline from "./outline.ts";
import qr from "./qr.ts";
import properties from "./properties.ts";
import sources from "./sources.ts";
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
  ...outline,
  ...media,
  ...qr,
  ...colors,
  ...fields,
  ...fileTree,
  ...details,
  ...critic,
  ...properties,
  ...sources,
} satisfies Record<string, RuleInfo>;

import type { NodeHandler } from "comark";
import * as annotate from "comark-annotate/html";
import * as badge from "comark-badge/html";
import * as cards from "comark-cards/html";
import * as carousel from "comark-carousel/html";
import * as charts from "comark-charts/html";
import * as chips from "comark-chips/html";
import * as code from "comark-code/html";
import * as diff from "comark-diff/html";
import * as embed from "comark-embed/html";
import * as fields from "comark-fields/html";
import * as github from "comark-github/html";
import * as icon from "comark-icon/html";
import * as media from "comark-media/html";
import * as steps from "comark-steps/html";
import * as tabs from "comark-tabs/html";
import * as zoom from "comark-zoom/html";
import { type Preset, type PresetOptions, preset } from "./index.ts";

export type { PresetOptions } from "./index.ts";

/** Every plugin for `@comark/html`, with the `components` to render them. */
export default (options?: PresetOptions): Preset<NodeHandler> =>
  preset<NodeHandler>(
    {
      annotate,
      badge,
      cards,
      carousel,
      charts,
      chips,
      code,
      diff,
      embed,
      fields,
      github,
      icon,
      media,
      steps,
      tabs,
      zoom,
    },
    options,
  );

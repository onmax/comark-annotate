import type { Component } from "vue";
import * as badge from "comark-badge/vue";
import * as cards from "comark-cards/vue";
import * as carousel from "comark-carousel/vue";
import * as charts from "comark-charts/vue";
import * as chips from "comark-chips/vue";
import * as code from "comark-code/vue";
import * as embed from "comark-embed/vue";
import * as details from "comark-details/vue";
import * as fileTree from "comark-file-tree/vue";
import * as fields from "comark-fields/vue";
import * as github from "comark-github/vue";
import * as icon from "comark-icon/vue";
import * as media from "comark-media/vue";
import * as steps from "comark-steps/vue";
import * as tabs from "comark-tabs/vue";
import * as zoom from "comark-zoom/vue";
import { type Preset, type PresetOptions, preset } from "./index.ts";

export type { PresetOptions } from "./index.ts";

/** Every plugin with components for `@comark/vue`, which leaves out annotate and diff. */
export default (options?: PresetOptions): Preset<Component> =>
  preset<Component>(
    {
      badge,
      cards,
      carousel,
      charts,
      chips,
      code,
      embed,
      details,
      fileTree,
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

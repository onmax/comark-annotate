import type { ComponentType } from "react";
import * as badge from "comark-badge/react";
import * as cards from "comark-cards/react";
import * as carousel from "comark-carousel/react";
import * as charts from "comark-charts/react";
import * as chips from "comark-chips/react";
import * as code from "comark-code/react";
import * as embed from "comark-embed/react";
import deflistPlugin from "comark-deflist";
import * as details from "comark-details/react";
import * as fileTree from "comark-file-tree/react";
import * as fields from "comark-fields/react";
import * as github from "comark-github/react";
import * as icon from "comark-icon/react";
import * as media from "comark-media/react";
import * as qr from "comark-qr/react";
import * as steps from "comark-steps/react";
import * as tabs from "comark-tabs/react";
import * as outline from "comark-outline/react";
import readingTimePlugin from "comark-reading-time";
import * as zoom from "comark-zoom/react";
const deflist = { default: deflistPlugin, components: {} };
const readingTime = { default: readingTimePlugin, components: {} };
// Narrow the renderer entry to the parse plugin and component map.
const mediaPart = { default: () => media.default(), components: media.components };
import { type Preset, type PresetOptions, preset } from "./index.ts";

export type { PresetOptions } from "./index.ts";

// oxlint-disable-next-line no-explicit-any -- the type `@comark/react` takes for its components.
type AnyComponent = ComponentType<any>;

/** Every plugin with components for `@comark/react`, which leaves out annotate and diff. */
export default (options?: PresetOptions): Preset<AnyComponent> =>
  preset<AnyComponent>(
    {
      badge,
      cards,
      carousel,
      charts,
      chips,
      code,
      embed,
      deflist,
      details,
      fileTree,
      fields,
      github,
      icon,
      media: mediaPart,
      outline,
      readingTime,
      qr,
      steps,
      tabs,
      zoom,
    },
    options,
  );

import type { ComponentType } from "react";
import * as badge from "comark-badge/react";
import * as cards from "comark-cards/react";
import * as carousel from "comark-carousel/react";
import * as charts from "comark-charts/react";
import * as chips from "comark-chips/react";
import * as code from "comark-code/react";
import * as embed from "comark-embed/react";
import * as fields from "comark-fields/react";
import * as github from "comark-github/react";
import * as icon from "comark-icon/react";
import * as media from "comark-media/react";
import * as steps from "comark-steps/react";
import * as tabs from "comark-tabs/react";
import * as zoom from "comark-zoom/react";
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

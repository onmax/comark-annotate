import type { ComponentType } from "react";
import * as badge from "comark-badge/react";
import * as cards from "comark-cards/react";
import * as carousel from "comark-carousel/react";
import * as cast from "comark-cast/react";
import * as charts from "comark-charts/react";
import * as chips from "comark-chips/react";
import * as code from "comark-code/react";
import * as codeNotes from "comark-code-notes/react";
import * as colors from "comark-colors/react";
import * as details from "comark-details/react";
import * as diagrams from "comark-diagrams/react";
import * as embed from "comark-embed/react";
import * as fields from "comark-fields/react";
import * as fileTree from "comark-file-tree/react";
import * as github from "comark-github/react";
import * as icon from "comark-icon/react";
import * as links from "comark-links/react";
import * as media from "comark-media/react";
import * as metrics from "comark-metrics/react";
import * as outline from "comark-outline/react";
import * as properties from "comark-properties/react";
import * as qr from "comark-qr/react";
import * as sources from "comark-sources/react";
import * as steps from "comark-steps/react";
import * as table from "comark-table/react";
import * as tabs from "comark-tabs/react";
import * as tests from "comark-tests/react";
import * as zoom from "comark-zoom/react";
import { type Preset, type PresetOptions, preset } from "./index.ts";

export { criticCss } from "./index.ts";
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
      cast,
      charts,
      chips,
      code,
      codeNotes,
      colors,
      details,
      diagrams,
      embed,
      fields,
      fileTree,
      github,
      icon,
      links,
      media,
      metrics,
      outline,
      properties,
      qr,
      sources,
      steps,
      table,
      tabs,
      tests,
      zoom,
    },
    options,
  );

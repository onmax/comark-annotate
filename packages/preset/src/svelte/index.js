// Every plugin with components for `@comark/svelte`, which leaves out annotate and diff.
import { preset } from "@onmax/comark";
import * as badge from "comark-badge/svelte";
import * as cards from "comark-cards/svelte";
import * as carousel from "comark-carousel/svelte";
import * as charts from "comark-charts/svelte";
import * as chips from "comark-chips/svelte";
import * as code from "comark-code/svelte";
import * as embed from "comark-embed/svelte";
import deflistPlugin from "comark-deflist";
import * as details from "comark-details/svelte";
import * as fileTree from "comark-file-tree/svelte";
import * as fields from "comark-fields/svelte";
import * as github from "comark-github/svelte";
import * as icon from "comark-icon/svelte";
import * as media from "comark-media/svelte";
import * as qr from "comark-qr/svelte";
import * as steps from "comark-steps/svelte";
import * as tabs from "comark-tabs/svelte";
import * as outline from "comark-outline/svelte";
import readingTimePlugin from "comark-reading-time";
import * as zoom from "comark-zoom/svelte";

const deflist = { default: deflistPlugin, components: {} };
const readingTime = { default: readingTimePlugin, components: {} };

export default (options) =>
  preset(
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
      media,
      outline,
      readingTime,
      qr,
      steps,
      tabs,
      zoom,
    },
    options,
  );

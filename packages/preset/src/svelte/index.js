// Every plugin with components for `@comark/svelte`, which leaves out annotate and diff.
import { preset } from "@onmax/comark";
import * as badge from "comark-badge/svelte";
import * as cards from "comark-cards/svelte";
import * as carousel from "comark-carousel/svelte";
import * as charts from "comark-charts/svelte";
import * as chips from "comark-chips/svelte";
import * as code from "comark-code/svelte";
import * as embed from "comark-embed/svelte";
import * as github from "comark-github/svelte";
import * as icon from "comark-icon/svelte";
import * as steps from "comark-steps/svelte";
import * as tabs from "comark-tabs/svelte";
import * as zoom from "comark-zoom/svelte";

export default (options) =>
  preset(
    { badge, cards, carousel, charts, chips, code, embed, github, icon, steps, tabs, zoom },
    options,
  );

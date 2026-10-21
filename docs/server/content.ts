import shiki from "@comark/html/plugins/shiki";
import { defineContent } from "@vite-hub/content";
import annotate from "comark-annotate";
import carousel from "comark-carousel";
import charts from "comark-charts";
import code from "comark-code";
import fs from "comark-content/sources/fs";
import embed from "comark-embed";
import { callouts as githubCallouts } from "comark-github";
import include from "comark-include";
import icon from "comark-icon";
import tabs from "comark-tabs";
import zoom from "comark-zoom";
import { useRuntimeConfig } from "nitro/runtime-config";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";

const { pagesDir } = useRuntimeConfig();

// Every page sits in pages/, so includes resolve from there.
export const plugins = () => [
  include({ root: pagesDir }),
  annotate(),
  carousel(),
  charts(),
  code(),
  embed(),
  githubCallouts(),
  tabs(),
  icon(),
  zoom(),
  shiki({ themes: { light, dark } }),
];

export const content = defineContent({
  source: fs(pagesDir, { exclude: ["partials/**"] }),
  markdown: { plugins: plugins() },
});

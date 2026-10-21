import shiki from "@comark/html/plugins/shiki";
import { defineContent } from "@vite-hub/content";
import annotate from "comark-annotate";
import carousel from "comark-carousel";
import charts from "comark-charts";
import fs from "comark-content/sources/fs";
import embed from "comark-embed";
import githubCallouts from "comark-github-callouts";
import include from "comark-include";
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
  embed(),
  githubCallouts(),
  tabs(),
  zoom(),
  shiki({ themes: { light, dark } }),
];

export const content = defineContent({
  source: fs(pagesDir, { exclude: ["partials/**"] }),
  markdown: { plugins: plugins() },
});

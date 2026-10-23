// The plugins that run in a browser, shared by the static pages and the playground so both render alike. comark-include
// reads files and comark-linter is a checker, so they're left out.
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import chips, { components as chipsComponents } from "../packages/chips/src/html.ts";
import code, { components as codeComponents } from "../packages/code/src/html.ts";
import diff, { components as diffComponents } from "../packages/diff/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import {
  callouts,
  components as githubComponents,
  html as githubHtml,
  references,
} from "../packages/github/src/html.ts";
import icon, { components as iconComponents } from "../packages/icon/src/html.ts";
import media, { components as mediaComponents } from "../packages/media/src/html.ts";
import steps, { components as stepsComponents } from "../packages/steps/src/html.ts";
import cards, { components as cardsComponents } from "../packages/cards/src/html.ts";
import badge, { components as badgeComponents } from "../packages/badge/src/html.ts";
import fields, { components as fieldsComponents } from "../packages/fields/src/html.ts";
import readingTime from "../packages/reading-time/src/index.ts";
import fileTree, { components as fileTreeComponents } from "../packages/file-tree/src/html.ts";
import details, { components as detailsComponents } from "../packages/details/src/html.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import outline, { components as outlineComponents } from "../packages/outline/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import type { PlayConfig } from "./config.ts";

// `download` is off in a browser, which may not download another site's images, so the reader's loads them as links.
// comark-code comes last, so a highlighter can go just before it and draw the lines it marks.
export const browserPlugins = (config: PlayConfig = {}, { download = true } = {}) => [
  annotate(),
  carousel(),
  charts(),
  chips({ download }),
  diff(),
  embed(),
  callouts(config["comark-github"]?.callouts),
  references(config["comark-github"]?.references),
  githubHtml(),
  icon(),
  details(),
  fileTree(),
  fields(),
  badge(),
  media(),
  cards(),
  steps(),
  // It only writes `meta.readingTime`, so it changes nothing the pages or the playground show.
  readingTime(),
  tabs(),
  outline(),
  zoom(config["comark-zoom"]),
  code(config["comark-code"]),
];

export const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...codeComponents,
  ...chartsComponents,
  ...chipsComponents,
  ...diffComponents,
  ...embedComponents,
  ...githubComponents,
  ...iconComponents,
  ...detailsComponents,
  ...fileTreeComponents,
  ...fieldsComponents,
  ...badgeComponents,
  ...mediaComponents,
  ...cardsComponents,
  ...stepsComponents,
  ...tabsComponents,
  ...outlineComponents,
  ...zoomComponents,
};

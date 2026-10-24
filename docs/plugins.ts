// The plugins that run in a browser, shared by the static pages and the playground so both render alike. comark-include
// reads files and comark-linter is a checker, so they're left out.
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import cast, { components as castComponents } from "../packages/cast/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import chips, { components as chipsComponents } from "../packages/chips/src/html.ts";
import colors, { components as colorsComponents } from "../packages/colors/src/html.ts";
import cjk from "../packages/cjk/src/index.ts";
import code, { components as codeComponents } from "../packages/code/src/html.ts";
import deflist from "../packages/deflist/src/index.ts";
import figure from "../packages/figure/src/index.ts";
import critic from "../packages/critic/src/index.ts";
import diagrams, { components as diagramsComponents } from "../packages/diagrams/src/html.ts";
import diff, { components as diffComponents } from "../packages/diff/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import footnotes from "../packages/footnotes/src/index.ts";
import {
  callouts,
  components as githubComponents,
  html as githubHtml,
  references,
} from "../packages/github/src/html.ts";
import icon, { components as iconComponents } from "../packages/icon/src/html.ts";
import mark from "../packages/mark/src/index.ts";
import { anchors, components as linksComponents, external } from "../packages/links/src/html.ts";
import media, { components as mediaComponents } from "../packages/media/src/html.ts";
import properties, { components as propertiesComponents } from "../packages/properties/src/html.ts";
import sources, { components as sourcesComponents } from "../packages/sources/src/html.ts";
import metrics, { components as metricsComponents } from "../packages/metrics/src/html.ts";
import steps, { components as stepsComponents } from "../packages/steps/src/html.ts";
import cards, { components as cardsComponents } from "../packages/cards/src/html.ts";
import badge, { components as badgeComponents } from "../packages/badge/src/html.ts";
import qr, { components as qrComponents } from "../packages/qr/src/html.ts";
import fields, { components as fieldsComponents } from "../packages/fields/src/html.ts";
import readingTime from "../packages/reading-time/src/index.ts";
import fileTree, { components as fileTreeComponents } from "../packages/file-tree/src/html.ts";
import details, { components as detailsComponents } from "../packages/details/src/html.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import outline, { components as outlineComponents } from "../packages/outline/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import type { PlayConfig } from "./config.ts";

// `download` is off in a browser, which may not download another site's images, so the reader's loads them as links.
export const browserPlugins = (config: PlayConfig = {}, { download = true } = {}) => [
  annotate(),
  carousel(),
  cjk(),
  deflist(),
  figure(),
  critic(),
  // The site's casts are written inline, and a browser has no files to read.
  cast({ read: () => undefined }),
  charts(),
  chips({ download }),
  colors(),
  diagrams(),
  diff(),
  embed(),
  footnotes(),
  callouts(config["comark-github"]?.callouts),
  references(config["comark-github"]?.references),
  githubHtml(),
  icon(),
  mark(),
  details(),
  external(config["comark-links"]?.external),
  anchors(config["comark-links"]?.anchors),
  fileTree(),
  fields(),
  properties(),
  badge(),
  media(),
  metrics(),
  cards(),
  qr(),
  sources(),
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
  ...castComponents,
  ...codeComponents,
  ...chartsComponents,
  ...chipsComponents,
  ...colorsComponents,
  ...diagramsComponents,
  ...diffComponents,
  ...embedComponents,
  ...githubComponents,
  ...iconComponents,
  ...detailsComponents,
  ...linksComponents,
  ...fileTreeComponents,
  ...fieldsComponents,
  ...propertiesComponents,
  ...badgeComponents,
  ...mediaComponents,
  ...metricsComponents,
  ...cardsComponents,
  ...qrComponents,
  ...sourcesComponents,
  ...stepsComponents,
  ...tabsComponents,
  ...outlineComponents,
  ...zoomComponents,
};

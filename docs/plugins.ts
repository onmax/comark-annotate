// The plugins that run in a browser, shared by the static pages and the playground so both render alike. comark-include
// reads files and comark-linter is a checker, so they're left out.
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import chips, { components as chipsComponents } from "../packages/chips/src/html.ts";
import code, { components as codeComponents } from "../packages/code/src/html.ts";
import deflist from "../packages/deflist/src/index.ts";
import diff, { components as diffComponents } from "../packages/diff/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import {
  callouts,
  components as githubComponents,
  html as githubHtml,
  references,
} from "../packages/github/src/html.ts";
import icon, { components as iconComponents } from "../packages/icon/src/html.ts";
import mark from "../packages/mark/src/index.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import type { PlayConfig } from "./config.ts";

// `download` is off in a browser, which may not download another site's images, so the reader's loads them as links.
export const browserPlugins = (config: PlayConfig = {}, { download = true } = {}) => [
  annotate(),
  carousel(),
  code(config["comark-code"]),
  deflist(),
  charts(),
  chips({ download }),
  diff(),
  embed(),
  callouts(config["comark-github"]?.callouts),
  references(config["comark-github"]?.references),
  githubHtml(),
  icon(),
  mark(),
  tabs(),
  zoom(config["comark-zoom"]),
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
  ...tabsComponents,
  ...zoomComponents,
};

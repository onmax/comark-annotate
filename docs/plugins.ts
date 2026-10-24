// The plugins that run in a browser, shared by the static pages and the playground so both render alike: the preset,
// so the site shows what it gives. comark-include reads files and comark-linter is a checker, so they're left out, and
// the preset's cast, table, and tests read no files, which a browser doesn't have.
import onmax from "../packages/preset/src/html.ts";
import type { PlayConfig } from "./config.ts";

// `download` is off in a browser, which may not download another site's images, so the reader's loads them as links.
export const browserPlugins = (config: PlayConfig = {}, { download = true } = {}) =>
  onmax({
    chips: { download },
    code: config["comark-code"],
    github: config["comark-github"],
    links: config["comark-links"],
    zoom: config["comark-zoom"],
  }).plugins;

export const { components } = onmax();

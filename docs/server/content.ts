import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import shiki from "@comark/html/plugins/shiki";
import { defineContent } from "@vite-hub/content";
import annotate from "comark-annotate";
import carousel from "comark-carousel";
import charts from "comark-charts";
import code from "comark-code";
import type { Source } from "comark-content";
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

const { pagesDir, packagesDir } = useRuntimeConfig();

// Only comark-include's examples include files, so includes resolve from its docs, where their partials sit.
export const plugins = () => [
  include({ root: join(packagesDir, "include/docs") }),
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

// docs/pages holds the site's own pages, and each package keeps its pages in its own docs/, served under its folder's
// name. A content instance reads one source, so this one reads them all.
function pages(): Source {
  const roots = [
    ["", fs(pagesDir)],
    ...readdirSync(packagesDir)
      .filter((folder) => existsSync(join(packagesDir, folder, "docs/index.md")))
      .map((folder) => [
        folder,
        fs(join(packagesDir, folder, "docs"), { exclude: ["partials/**"] }),
      ]),
  ] as const;
  const find = (key: string) => {
    const at = key.split("/", 1)[0] ?? "";
    const [prefix, source] = roots.find(([folder]) => folder && folder === at) ?? roots[0];
    return { source, key: prefix ? key.slice(prefix.length + 1) : key };
  };
  return {
    keys: async () =>
      (
        await Promise.all(
          roots.map(async ([prefix, source]) =>
            (await source.keys()).map((key) => (prefix ? `${prefix}/${key}` : key)),
          ),
        )
      ).flat(),
    getItem: (key) => {
      const found = find(key);
      return found.source.getItem(found.key);
    },
    getItemRaw: (key) => {
      const found = find(key);
      return found.source.getItemRaw(found.key);
    },
    watch: async (callback) => {
      const stops = await Promise.all(
        roots.map(([prefix, source]) =>
          source.watch?.((event, key) => callback(event, prefix ? `${prefix}/${key}` : key)),
        ),
      );
      return async () => {
        await Promise.all(stops.map((stop) => stop?.()));
      };
    },
  };
}

export const content = defineContent({
  source: pages(),
  markdown: { plugins: plugins() },
});

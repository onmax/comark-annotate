// A new package has to be registered in several places that nothing else checks: its manifest's shared fields, the
// linter that loads it, the docs that render it, and the README that lists it. This fails on the first one missed.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const repo = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, repo), "utf8");
const folders = readdirSync(new URL("packages/", repo)).filter((folder) =>
  existsSync(new URL(`packages/${folder}/package.json`, repo)),
);
type Manifest = {
  name: string;
  version: string;
  license: string;
  author: string;
  type: string;
  homepage: string;
  bugs: string;
  repository: { directory: string };
  files: string[];
  engines?: { node: string };
  scripts: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};
// SAFETY: every package.json in packages/ is a published manifest with these fields; the tests below check them.
const manifest = (folder: string) =>
  JSON.parse(read(`packages/${folder}/package.json`)) as Manifest;
const withRenderer = folders.filter((folder) =>
  existsSync(new URL(`packages/${folder}/src/html.ts`, repo)),
);

describe.each(folders)("packages/%s", (folder) => {
  const pkg = manifest(folder);

  it("shares the workspace's version, license, and links", () => {
    expect(pkg).toMatchObject({
      version: manifest("zoom").version,
      license: "MIT",
      author: "onmax",
      type: "module",
      homepage: `https://comark.onmax.me/${folder}`,
      bugs: "https://github.com/onmax/comark-plugins/issues",
      repository: { directory: `packages/${folder}` },
      engines: { node: ">=22.12.0" },
    });
    expect(pkg.files).toContain("dist");
    expect(pkg.files).not.toContain("docs");
  });

  it("builds with the shared preset, and before it packs", () => {
    expect(pkg.scripts.build).toBe("tsdown");
    expect(pkg.scripts.prepack).toMatch(new RegExp(`pnpm --filter ${pkg.name}(\\.\\.\\.)? build$`));
    expect(read(`packages/${folder}/tsdown.config.ts`)).toContain('from "../../tsdown.shared.ts"');
  });

  it("starts its LICENSE with the repository's", () => {
    expect(read(`packages/${folder}/LICENSE`).startsWith(read("LICENSE").trimEnd())).toBe(true);
  });

  it("has docs with a place in the site, and a row in the README", () => {
    expect(existsSync(new URL(`packages/${folder}/docs/index.md`, repo))).toBe(true);
    expect(read("docs/build.ts")).toContain(`"${folder}",`);
    expect(read("README.md")).toContain(`[\`${pkg.name}\`](./packages/${folder})`);
  });
});

describe.each(withRenderer)("the renderer of packages/%s", (folder) => {
  const { name } = manifest(folder);

  it("is an optional peer the linter loads", () => {
    const lint = manifest("lint");
    expect(lint.peerDependencies?.[name]).toBe("workspace:^");
    expect(lint.peerDependenciesMeta?.[name]).toEqual({ optional: true });
    expect(read("packages/lint/src/config.ts")).toContain(`import("${name}/html")`);
  });

  it("renders the docs and the playground", () => {
    const plugins = read("docs/plugins.ts");
    expect(plugins).toContain(`from "../packages/${folder}/src/html.ts"`);

    // Keep the import and both runtime registries in sync. The import alone can
    // remain present after a plugin is accidentally removed from the site.
    // A folder such as file-tree imports as fileTree.
    const name = folder.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
    const imported =
      folder === "github"
        ? { plugin: "githubHtml", components: "githubComponents" }
        : folder === "links"
          ? { plugin: "anchors", components: "linksComponents" }
          : {
              plugin: name,
              components: `${name}Components`,
            };
    const browser = plugins.slice(
      plugins.indexOf("export const browserPlugins"),
      plugins.indexOf("export const components"),
    );
    const componentMap = plugins.slice(plugins.indexOf("export const components"));
    expect(browser).toMatch(new RegExp(`${imported.plugin}\\s*\\(`));
    expect(componentMap).toContain(`...${imported.components}`);
  });
});

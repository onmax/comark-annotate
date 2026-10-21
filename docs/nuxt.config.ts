import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseMarkdown } from "comark";
import { defineNuxtConfig } from "nuxt/config";

const root = new URL("./", import.meta.url);
const generated = new URL(".generated/public/", root);
const str = (value: unknown) => (typeof value === "string" ? value : "");

// Fonts and the agent skill keep the paths the old static build gave them, which `npx skills add` and old links read.
async function writeAssets() {
  await rm(generated, { recursive: true, force: true });
  await mkdir(new URL("fonts/", generated), { recursive: true });
  const fonts = new URL("../node_modules/geist/dist/fonts/", root);
  for (const font of ["geist-sans/Geist-Variable.woff2", "geist-mono/GeistMono-Variable.woff2"])
    await cp(new URL(font, fonts), new URL(`fonts/${font.split("/")[1]}`, generated));
  await cp(
    new URL(
      "../node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2",
      root,
    ),
    new URL("fonts/Caveat-Variable.woff2", generated),
  );
  const skills = await Promise.all(
    ["annotate/skills/comark-annotate", "charts/skills/comark-charts"].map(async (folder) => {
      const text = await readFile(new URL(`../packages/${folder}/SKILL.md`, root), "utf8");
      const meta = (await parseMarkdown(text)).frontmatter;
      return { text, name: str(meta.name), description: str(meta.description) };
    }),
  );
  for (const skill of skills)
    for (const base of ["agent-skills", "skills"]) {
      await mkdir(new URL(`.well-known/${base}/${skill.name}/`, generated), { recursive: true });
      await writeFile(new URL(`.well-known/${base}/${skill.name}/SKILL.md`, generated), skill.text);
    }
  await writeFile(
    new URL(".well-known/agent-skills/index.json", generated),
    JSON.stringify({
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: skills.map(({ text, name, description }) => ({
        name,
        type: "skill-md",
        description,
        url: `/.well-known/agent-skills/${name}/SKILL.md`,
        digest: `sha256:${createHash("sha256").update(text).digest("hex")}`,
      })),
    }),
  );
  await writeFile(
    new URL(".well-known/skills/index.json", generated),
    JSON.stringify({
      skills: skills.map(({ name, description }) => ({ name, description, files: ["SKILL.md"] })),
    }),
  );

  // The playground is a standalone browser app. Keep its generated HTML and
  // script under Nitro's public root so `/play/` remains available alongside
  // the Nuxt-rendered documentation pages.
  const playground = new URL("dist/play/", root);
  if (existsSync(playground)) await cp(playground, new URL("play/", generated), { recursive: true });
}

export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: false },
  telemetry: false,
  experimental: {
    componentIslands: true,
    // Prefetching a page also fetches its body, and the header links to every page.
    defaults: { nuxtLink: { prefetchOn: { visibility: false, interaction: true } } },
  },
  css: ["~~/style.css"],
  runtimeConfig: { pagesDir: fileURLToPath(new URL("pages/", root)) },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        {
          rel: "preload",
          href: "/fonts/Geist-Variable.woff2",
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
    },
  },
  modules: [
    async (_, nuxt) => {
      await writeAssets();
      nuxt.options.nitro.publicAssets ??= [];
      nuxt.options.nitro.publicAssets.push({ dir: fileURLToPath(generated), maxAge: 0 });
    },
  ],
  nitro: {
    output: { dir: fileURLToPath(new URL("dist/", root)) },
    prerender: { crawlLinks: true, failOnError: true, routes: ["/"] },
  },
});

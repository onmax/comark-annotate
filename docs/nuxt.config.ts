import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
  const skill = await readFile(
    new URL("../packages/annotate/skills/comark-annotate/SKILL.md", root),
    "utf8",
  );
  const meta = (await parseMarkdown(skill)).frontmatter;
  const [name, description] = [str(meta.name), str(meta.description)];
  for (const base of ["agent-skills", "skills"]) {
    await mkdir(new URL(`.well-known/${base}/${name}/`, generated), { recursive: true });
    await writeFile(new URL(`.well-known/${base}/${name}/SKILL.md`, generated), skill);
  }
  await writeFile(
    new URL(".well-known/agent-skills/index.json", generated),
    JSON.stringify({
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name,
          type: "skill-md",
          description,
          url: `/.well-known/agent-skills/${name}/SKILL.md`,
          digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
        },
      ],
    }),
  );
  await writeFile(
    new URL(".well-known/skills/index.json", generated),
    JSON.stringify({ skills: [{ name, description, files: ["SKILL.md"] }] }),
  );
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
    prerender: { crawlLinks: true, failOnError: true, routes: ["/"] },
  },
});

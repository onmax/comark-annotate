import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { parseMarkdown } from "comark";

const folder = new URL("../packages/preset/skills/comark-plugins/", import.meta.url);

/**
 * Writes the agent skill under `out` for Agent Skills Discovery: v0.1 file by file, and v0.2 as one archive with its
 * digest, since v0.2 serves a skill with references only as an archive and `npx skills add` reads v0.2 first.
 */
export async function writeSkill(out: URL) {
  const names = (await readdir(folder, { recursive: true }))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const files = await Promise.all(
    names.map(async (file) => [file, await readFile(new URL(file, folder))] as const),
  );
  const { name, description } = (await parseMarkdown(String(files[0]![1]))).frontmatter;
  if (names[0] !== "SKILL.md" || typeof name !== "string" || typeof description !== "string")
    throw new Error(
      `${folder.pathname}SKILL.md needs a name and a description in its frontmatter.`,
    );

  for (const [file, data] of files) {
    const target = new URL(`.well-known/skills/${name}/${file}`, out);
    await mkdir(new URL("./", target), { recursive: true });
    await writeFile(target, data);
  }
  await writeFile(
    new URL(".well-known/skills/index.json", out),
    JSON.stringify({ skills: [{ name, description, files: names }] }),
  );

  const archive = tarGz(files);
  await mkdir(new URL(".well-known/agent-skills/", out), { recursive: true });
  await writeFile(new URL(`.well-known/agent-skills/${name}.tar.gz`, out), archive);
  await writeFile(
    new URL(".well-known/agent-skills/index.json", out),
    JSON.stringify({
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name,
          type: "archive",
          description,
          url: `/.well-known/agent-skills/${name}.tar.gz`,
          digest: `sha256:${createHash("sha256").update(archive).digest("hex")}`,
        },
      ],
    }),
  );
}

// Files sit at the archive's root, as the RFC asks, with fixed modes and dates so the digest changes only with them.
function tarGz(files: (readonly [string, Buffer])[]) {
  const blocks = files.flatMap(([file, data]) => {
    const header = Buffer.alloc(512);
    const octal = (offset: number, length: number, value: number) =>
      header.write(`${value.toString(8).padStart(length - 1, "0")}\0`, offset, "ascii");
    header.write(file, 0, "ascii");
    octal(100, 8, 0o644);
    octal(108, 8, 0);
    octal(116, 8, 0);
    octal(124, 12, data.length);
    octal(136, 12, 0);
    header.write(" ".repeat(8), 148, "ascii");
    header.write("0", 156, "ascii");
    header.write("ustar\u000000", 257, "ascii");
    const sum = header.reduce((total, byte) => total + byte, 0);
    octal(148, 7, sum);
    return [header, data, Buffer.alloc((512 - (data.length % 512)) % 512)];
  });
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

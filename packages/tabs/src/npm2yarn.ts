import npmToYarn from "npm-to-yarn";

// SAFETY: npm-to-yarn's ES module exports `convert` as its default, but its types sit in a CommonJS package, so
// TypeScript reads that default as the whole module.
const convert = npmToYarn as unknown as typeof npmToYarn.default;

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "deno";

export const defaultManagers: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

// npm-to-yarn matches `npm` anywhere in what it's given, so `cd my-npm-app` would break: it only sees commands that
// start a line or follow `&&`, `||`, or `;`.
const COMMAND = /^\s*np[mx] /;
const SEPARATOR = /(\s*(?:&&|\|\||;)\s*)/;
const FAILED = "# couldn't auto-convert command";

// Bun's docs, Nuxt's, and Starlight's write `bunx` and `bun create astro`, where npm-to-yarn writes `bun x` and
// `bunx create-astro`. pnpm's form of a create command is already bun's, once it says bun.
function toBun(command: string) {
  if (/^\s*npm (?:init|create) [^-]/.test(command))
    return convert(command, "pnpm").replace(/^(\s*)pnpm/, "$1bun");
  return convert(command, "bun").replace(/^(\s*)bun x /, "$1bunx ");
}

/** The source in each manager's words, or the npm commands it has no form for. */
export function translate(source: string, manager: PackageManager) {
  if (manager === "npm") return { code: source, failed: [] };
  const failed: string[] = [];
  const lines = source.split("\n").map((line) =>
    line
      .split(SEPARATOR)
      .map((part) => {
        if (!COMMAND.test(part)) return part;
        const result = manager === "bun" ? toBun(part) : convert(part, manager);
        if (!result.includes(FAILED)) return result;
        failed.push(part.trim());
        return part;
      })
      .join(""),
  );
  return { code: lines.join("\n"), failed };
}

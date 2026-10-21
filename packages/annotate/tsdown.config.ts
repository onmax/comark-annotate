import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  publint: true,
  exports: {
    exclude: ["cli"],
    bin: { "comark-annotate": "src/cli.ts" },
    // Apps that serve skills to their own agents import the skill from here, so it matches the renderer they installed.
    customExports: { "./skills/*": "./skills/*" },
  },
});

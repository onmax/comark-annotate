import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  publint: true,
  exports: {
    exclude: ["cli"],
    legacy: true,
    bin: { "comark-annotate": "src/cli.ts" },
  },
});

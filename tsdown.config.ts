import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  exports: {
    exclude: ["cli"],
    bin: { "comark-annotate": "src/cli.ts" },
  },
});

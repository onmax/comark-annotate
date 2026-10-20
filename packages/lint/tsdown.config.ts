import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/doctor.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  publint: true,
  exports: {
    exclude: ["cli"],
    bin: { "comark-lint": "src/cli.ts" },
  },
});

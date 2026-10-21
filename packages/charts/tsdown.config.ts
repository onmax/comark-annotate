import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  publint: true,
});

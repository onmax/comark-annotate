import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts", "src/client.ts", "src/vue.ts", "src/react.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  // Svelte components ship as source; the app's Svelte compiler builds them.
  copy: [{ from: "src/svelte", to: "dist" }],
});

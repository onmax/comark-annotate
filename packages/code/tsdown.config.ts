import { defineConfig } from "tsdown";
import { css } from "./src/styles.ts";

export default defineConfig({
  entry: ["src/index.ts", "src/html.ts", "src/client.ts", "src/vue.ts", "src/react.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  publint: true,
  // Svelte components ship as source; the app's Svelte compiler builds them.
  copy: [{ from: "src/svelte", to: "dist" }],
  plugins: [
    {
      // For apps that load the styles with their CSS, so server-rendered pages don't shift when the script starts.
      name: "style-css",
      generateBundle() {
        this.emitFile({ type: "asset", fileName: "style.css", source: css });
      },
    },
  ],
});

// Every package builds ESM with types and fails on publint, and the ones with components build them the same way.
import { defineConfig, type UserConfig } from "tsdown";

export const definePackage = (config: UserConfig) =>
  defineConfig({ format: ["esm"], dts: true, clean: true, publint: true, ...config });

/** A package with a renderer per framework: `html`, `client`, `vue`, `react`, and `svelte`, plus `style.css`. */
export const defineComponentsPackage = (css: string, entry: string[] = []) =>
  definePackage({
    entry: ["src/index.ts", "src/html.ts", "src/client.ts", "src/vue.ts", "src/react.ts", ...entry],
    // Svelte components ship as source; the app's Svelte compiler builds them.
    copy: [{ from: "src/svelte", to: "dist" }],
    plugins: [
      {
        // For apps that load the styles with their CSS, so server-rendered pages don't shift when the styles arrive.
        name: "style-css",
        generateBundle() {
          this.emitFile({ type: "asset", fileName: "style.css", source: css });
        },
      },
    ],
  });

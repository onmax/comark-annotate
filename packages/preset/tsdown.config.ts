import { definePackage } from "../../tsdown.shared.ts";

export default definePackage({
  entry: ["src/index.ts", "src/client.ts", "src/html.ts", "src/vue.ts", "src/react.ts"],
  // Svelte entries ship as source, like every package's.
  copy: [{ from: "src/svelte", to: "dist" }],
});

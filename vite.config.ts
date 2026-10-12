import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  // oxfmt reads Comark blocks as plain Markdown and breaks them.
  fmt: { ignorePatterns: ["**/dist/**", "**/*.md"] },
  lint: {
    ignorePatterns: ["**/dist/**"],
    options: { typeAware: true, typeCheck: true },
  },
});

import comark from "lint-comark/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

// The packages run their own Doctor configs; this one only lints the docs pages with lint-comark.
export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [
    comark({
      include: "docs/pages/**/*.md",
      // docs/build.ts renders these itself.
      components: ["drop", "example", "examples", "hero", "matrix", "packages"],
    }),
  ],
});

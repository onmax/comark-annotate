import comark from "comark-linter/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

// The packages run their own Doctor configs; this one only lints the docs pages with comark-linter.
export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [
    comark({
      include: "{docs/pages,packages/*/docs}/**/*.md",
      // docs/build.ts renders these itself.
      components: [
        "correct",
        "demo",
        "drop",
        "example",
        "examples",
        "hero",
        "incorrect",
        "matrix",
        "packages",
        "rules",
      ],
    }),
  ],
});

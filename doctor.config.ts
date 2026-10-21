import comark from "comark-lint/doctor";
import { defineDoctorConfig } from "vite-doctor/config";

// The packages run their own Doctor configs; this one only lints the docs pages with comark-lint.
export default defineDoctorConfig({
  extends: ["comark/recommended"],
  extensions: [
    comark({
      include: "docs/pages/**/*.md",
      // docs/build.ts renders the first three itself. comark-tabs turns `::code-group` into tabs while parsing, so its
      // renderer has no component of that name.
      components: ["cards", "example", "examples", "code-group"],
    }),
  ],
});

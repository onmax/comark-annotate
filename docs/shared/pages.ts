// The index first, then one page per package, each at its own path.
export const pages = [
  { slug: "", npm: "" },
  { slug: "annotate", npm: "comark-annotate" },
  { slug: "zoom", npm: "comark-zoom" },
  { slug: "carousel", npm: "comark-carousel" },
  { slug: "tabs", npm: "comark-tabs" },
  { slug: "github-callouts", npm: "comark-github-callouts" },
  { slug: "lint", npm: "comark-lint" },
  { slug: "include", npm: "comark-include" },
  { slug: "embed", npm: "comark-embed" },
];

export interface Page {
  slug: string;
  npm: string;
  title: string;
  description: string;
  tagline: string;
  install: string;
  /** The rendered body. HTML-only renderers inline their scripts in it. */
  html: string;
  nav: { level: "h2" | "h3"; id: string; text: string }[];
}

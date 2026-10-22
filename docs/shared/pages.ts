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
  pages: { slug: string; npm: string }[];
}

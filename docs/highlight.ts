// Colors the playground's editor with Comark's own grammar, the one the docs' code blocks get from the Shiki plugin.
// The JavaScript regex engine keeps WebAssembly out of the page.
import { comarkLanguages } from "comark/plugins/shiki/language-comark";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import dark from "shiki/themes/vitesse-dark.mjs";
import light from "shiki/themes/vitesse-light.mjs";

const highlighter = await createHighlighterCore({
  themes: [light, dark],
  langs: comarkLanguages,
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});

export const highlight = (code: string) =>
  highlighter.codeToHtml(code, {
    lang: "mdc",
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
  });

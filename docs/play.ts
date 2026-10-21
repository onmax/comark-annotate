// The playground: renders the editor's Markdown in the browser with every plugin that runs there. comark-include
// reads files and comark-linter is a checker, so they're left out, and so is Shiki, which would triple the bundle.
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import githubCallouts, {
  components as githubCalloutsComponents,
} from "../packages/github-callouts/src/html.ts";
import icon, { components as iconComponents } from "../packages/icon/src/html.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import { previewDocument } from "./preview.ts";

const plugins = () => [
  annotate(),
  carousel(),
  charts(),
  embed(),
  githubCallouts(),
  icon(),
  tabs(),
  zoom(),
];
const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...chartsComponents,
  ...embedComponents,
  ...githubCalloutsComponents,
  ...iconComponents,
  ...tabsComponents,
  ...zoomComponents,
};

function find<T extends Element>(selector: string, type: new () => T) {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`The playground needs ${selector}.`);
  return element;
}
const editor = find(".play textarea", HTMLTextAreaElement);
const preview = find(".play-preview", HTMLIFrameElement);
const issues = find(".play-issues", HTMLUListElement);
const share = find(".play-share", HTMLButtonElement);
const paint = find(".play-paint", HTMLDivElement);
const npmx = find(".top a.npmx", HTMLAnchorElement);
const npmxName = find(".top a.npmx span", HTMLSpanElement);
const presets: { id: string; source: string; npm: string }[] = JSON.parse(
  find("#presets", HTMLScriptElement).text,
);

// A shared link carries its Markdown in the hash, deflated, so nothing is stored anywhere.
const sharingUnsupported = "Sharing is unavailable in this browser (raw deflate is not supported).";
function compressionStream(kind: "compress" | "decompress") {
  const Stream = kind === "compress" ? CompressionStream : DecompressionStream;
  if (typeof Stream !== "function") throw new Error(sharingUnsupported);
  try {
    return new Stream("deflate-raw");
  } catch {
    throw new Error(sharingUnsupported);
  }
}
async function pack(text: string) {
  const stream = new Blob([text]).stream().pipeThrough(compressionStream("compress"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
async function unpack(code: string) {
  const binary = atob(code.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(compressionStream("decompress"));
  return new Response(stream).text();
}

// The editor is a transparent textarea over its own text, colored. Until the grammar loads, the text under it is
// plain. The extra line keeps a trailing newline as tall as the textarea's.
let highlight: ((code: string) => string) | undefined;
function repaint() {
  const text = `${editor.value}\n `;
  if (highlight) paint.innerHTML = highlight(text);
  else paint.replaceChildren(Object.assign(document.createElement("pre"), { textContent: text }));
}
void import("./highlight.ts").then((module) => {
  highlight = module.highlight;
  repaint();
});

function showIssues(list: string[]) {
  issues.replaceChildren(
    ...list.map((issue) => Object.assign(document.createElement("li"), { textContent: issue })),
  );
  issues.hidden = !list.length;
}

function markPreset(id?: string) {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".pages a[data-preset]"))
    link.toggleAttribute("aria-current", link.dataset.preset === id);
}

// The header's npmx link follows the preset, and stays on its package while you edit it. A shared link's Markdown
// could use any of them, so it gets the page with all of them.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function pointNpmx(npm?: string) {
  npmx.href = `https://npmx.dev/${npm ? `package/${npm}` : "~onmax_"}`;
  npmx.title = npm ? `${npm} on npmx` : "Every package on npmx";
  const name = npm || "npmx";
  if (npmxName.textContent === name) return;
  const from = npmx.offsetWidth;
  npmxName.textContent = name;
  const to = npmx.offsetWidth;
  // The pill resizes to the new name as the name rises into it, so the swap reads as one change of package.
  const ease = "cubic-bezier(0.23, 1, 0.32, 1)";
  if (reducedMotion.matches) {
    npmxName.animate({ opacity: [0, 1] }, { duration: 150, easing: "ease-out" });
    return;
  }
  if (from !== to)
    npmx.animate({ width: [`${from}px`, `${to}px`] }, { duration: 250, easing: ease });
  npmxName.animate(
    { opacity: [0, 1], filter: ["blur(2px)", "blur(0)"], transform: ["translateY(6px)", "none"] },
    { duration: 200, easing: ease },
  );
}

let run = 0;
async function render() {
  const current = ++run;
  let html = "";
  let problems: string[] = [];
  try {
    const parsed = await parseMarkdown(editor.value, { plugins: plugins() });
    html = await renderHtmlFromDocument(parsed, { components });
    problems = parsed.meta.issues;
  } catch (error) {
    problems = [error instanceof Error ? error.message : String(error)];
  }
  // A slower render of older text must not replace a newer one.
  if (current !== run) return;
  const top = preview.contentWindow?.scrollY ?? 0;
  preview.addEventListener("load", () => preview.contentWindow?.scrollTo(0, top), { once: true });
  preview.srcdoc = previewDocument(html);
  showIssues(problems);
}

async function load() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const code = hash.get("md");
  const preset =
    presets.find((preset) => preset.id === hash.get("preset")) ??
    (code === null ? presets[0] : undefined);
  if (preset) editor.value = preset.source;
  else if (code !== null)
    editor.value = await unpack(code).catch((error) => {
      editor.value =
        error instanceof Error && error.message === sharingUnsupported
          ? sharingUnsupported
          : "The link's Markdown is cut off or changed.";
      return editor.value;
    });
  markPreset(preset?.id);
  pointNpmx(preset?.npm);
  repaint();
  await render();
}

let timer: ReturnType<typeof setTimeout> | undefined;
editor.addEventListener("input", () => {
  repaint();
  clearTimeout(timer);
  timer = setTimeout(async () => {
    markPreset();
    // Replaced, not pushed: Back leaves the playground instead of stepping through keystrokes.
    try {
      history.replaceState(null, "", `#md=${await pack(editor.value)}`);
    } catch (error) {
      showIssues([error instanceof Error ? error.message : String(error)]);
    }
    await render();
  }, 200);
});
share.addEventListener("click", async () => {
  try {
    if (!location.hash.startsWith("#md="))
      history.replaceState(null, "", `#md=${await pack(editor.value)}`);
    await navigator.clipboard.writeText(location.href);
    share.textContent = "Copied";
    setTimeout(() => (share.textContent = "Copy link"), 1500);
  } catch (error) {
    showIssues([error instanceof Error ? error.message : String(error)]);
  }
});
addEventListener("hashchange", load);
// The build already rendered the first preset, so only a link to something else needs a render now.
if (location.hash) await load();
else markPreset(presets[0]?.id);

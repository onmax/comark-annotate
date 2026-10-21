// The playground: renders the editor's Markdown in the browser with every plugin that runs there. comark-include
// reads files and comark-linter is a checker, so they're left out, and so is Shiki, which would triple the bundle.
import { renderHtmlFromDocument } from "@comark/html";
import { parseMarkdown } from "comark";
import annotate, { components as annotateComponents } from "../packages/annotate/src/html.ts";
import carousel, { components as carouselComponents } from "../packages/carousel/src/html.ts";
import charts, { components as chartsComponents } from "../packages/charts/src/html.ts";
import code, { components as codeComponents } from "../packages/code/src/html.ts";
import diff, { components as diffComponents } from "../packages/diff/src/html.ts";
import embed, { components as embedComponents } from "../packages/embed/src/html.ts";
import githubCallouts, {
  components as githubCalloutsComponents,
} from "../packages/github-callouts/src/html.ts";
import icon, { components as iconComponents } from "../packages/icon/src/html.ts";
import tabs, { components as tabsComponents } from "../packages/tabs/src/html.ts";
import zoom, { components as zoomComponents } from "../packages/zoom/src/html.ts";
import { defaultConfig, type PlayConfig, readConfig } from "./config.ts";
import { previewDocument } from "./preview.ts";

const plugins = (config: PlayConfig) => [
  annotate(),
  carousel(),
  charts(),
  code(config["comark-code"]),
  diff(),
  embed(),
  githubCallouts(config["comark-github-callouts"]),
  icon(),
  tabs(),
  zoom(config["comark-zoom"]),
];
const components = {
  ...annotateComponents,
  ...carouselComponents,
  ...chartsComponents,
  ...codeComponents,
  ...diffComponents,
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
const editor = find('.play-code[data-pane="markdown"] textarea', HTMLTextAreaElement);
const configEditor = find('.play-code[data-pane="config"] textarea', HTMLTextAreaElement);
const panes = find(".play-panes", HTMLDivElement);
const preview = find(".play-preview", HTMLIFrameElement);
const issues = find(".play-issues", HTMLUListElement);
const share = find(".play-share", HTMLButtonElement);
const npmx = find(".top a.npmx", HTMLAnchorElement);
const npmxName = find(".top a.npmx span", HTMLSpanElement);
const presets: { id: string; source: string; npm: string }[] = JSON.parse(
  find("#presets", HTMLScriptElement).text,
);

// A shared link carries its Markdown in the hash, deflated, so nothing is stored anywhere. A changed config rides
// along the same way.
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
let highlight: ((code: string, lang: "mdc" | "json") => string) | undefined;
function repaint(textarea = editor) {
  const paint = textarea.previousElementSibling;
  if (!paint) return;
  const text = `${textarea.value}\n `;
  if (highlight) paint.innerHTML = highlight(text, textarea === editor ? "mdc" : "json");
  else paint.replaceChildren(Object.assign(document.createElement("pre"), { textContent: text }));
}
void import("./highlight.ts").then((module) => {
  highlight = module.highlight;
  repaint(editor);
  repaint(configEditor);
});

// The Markdown and the config share the editor's column; the bar's switch shows one of them.
panes.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!button?.dataset.pane) return;
  for (const other of panes.querySelectorAll("button"))
    other.setAttribute("aria-pressed", String(other === button));
  for (const code of document.querySelectorAll<HTMLElement>(".play-code"))
    code.hidden = code.dataset.pane !== button.dataset.pane;
});

// Each still in the presets' column is a page laid out at full width. It's scaled to show all of itself, unless that
// would fill less than most of its card's width; then it fills that much and shows its top.
function fit(thumb: HTMLElement) {
  const page = thumb.firstElementChild;
  if (!(page instanceof HTMLElement) || !thumb.clientWidth || !page.offsetWidth) return;
  const { clientWidth: width, clientHeight: height } = thumb;
  const scale = Math.min(
    width / page.offsetWidth,
    Math.max(height / page.offsetHeight, (width * 0.7) / page.offsetWidth),
  );
  const x = (width - page.offsetWidth * scale) / 2;
  const y = Math.max(0, (height - page.offsetHeight * scale) / 2);
  page.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}
const fitting = new ResizeObserver((entries) => {
  for (const { target } of entries)
    if (target instanceof HTMLElement)
      fit(target.classList.contains("preset-thumb") ? target : (target.parentElement ?? target));
});
for (const thumb of document.querySelectorAll(".preset-thumb")) {
  fitting.observe(thumb);
  if (thumb.firstElementChild) fitting.observe(thumb.firstElementChild);
}

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
let loadIssues: string[] = [];
async function render() {
  const current = ++run;
  let html = "";
  const { config, issues: configIssues } = readConfig(configEditor.value);
  let problems: string[] = [];
  try {
    const parsed = await parseMarkdown(editor.value, { plugins: plugins(config) });
    html = await renderHtmlFromDocument(parsed, { components });
    problems = [...loadIssues, ...configIssues, ...parsed.meta.issues];
  } catch (error) {
    problems = [
      ...loadIssues,
      ...configIssues,
      error instanceof Error ? error.message : String(error),
    ];
  }
  // A slower render of older text must not replace a newer one.
  if (current !== run) return;
  const top = preview.contentWindow?.scrollY ?? 0;
  preview.addEventListener("load", () => preview.contentWindow?.scrollTo(0, top), { once: true });
  preview.srcdoc = previewDocument(html);
  showIssues(problems);
}

async function link() {
  const config =
    configEditor.value === defaultConfig ? "" : `&config=${await pack(configEditor.value)}`;
  return `#md=${await pack(editor.value)}${config}`;
}

async function load() {
  loadIssues = [];
  const hash = new URLSearchParams(location.hash.slice(1));
  const code = hash.get("md");
  const config = hash.get("config");
  // A preset keeps whatever config is in the tab, so one config can be tried across them.
  if (config !== null) {
    configEditor.value = await unpack(config).catch(() => {
      loadIssues.push("The link's config is cut off or changed; using the default config.");
      return defaultConfig;
    });
    repaint(configEditor);
  } else if (code !== null) configEditor.value = defaultConfig;
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
  repaint(editor);
  repaint(configEditor);
  await render();
}

let timer: ReturnType<typeof setTimeout> | undefined;
for (const textarea of [editor, configEditor])
  textarea.addEventListener("input", () => {
    if (textarea === configEditor) {
      loadIssues = [];
    }
    repaint(textarea);
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (textarea === editor) markPreset();
      // Replaced, not pushed: Back leaves the playground instead of stepping through keystrokes.
      try {
        history.replaceState(null, "", await link());
      } catch (error) {
        showIssues([error instanceof Error ? error.message : String(error)]);
      }
      await render();
    }, 200);
  });
share.addEventListener("click", async () => {
  try {
    history.replaceState(null, "", await link());
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

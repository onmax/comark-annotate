/** One of your actions as the parse plugin writes it on a code block. */
export type ActionButton = { id: string; label: string };

/** What the `comark-code-action` event carries: the action's `id`, the block's code, and its language. */
export type CodeActionDetail = { action: string; code: string; language: string };

declare global {
  interface Window {
    __comarkCode?: { users: number; stop: () => void };
  }
  // The event bubbles from the block, so a listener anywhere above it gets a typed `detail`.
  interface HTMLElementEventMap {
    "comark-code-action": CustomEvent<CodeActionDetail>;
  }
  interface DocumentEventMap {
    "comark-code-action": CustomEvent<CodeActionDetail>;
  }
  interface WindowEventMap {
    "comark-code-action": CustomEvent<CodeActionDetail>;
  }
}

/**
 * Starts the buttons of every `.ck` code block on the page and returns a function that stops them. Every caller shares
 * one set of listeners, which stop with the last caller. The function is self-contained: the HTML renderer inlines its
 * source as a script, so it must not use anything from outside its body.
 */
export function start(css: string): () => void {
  const running = window.__comarkCode;
  if (running) {
    running.users++;
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;
  // The page may already carry the styles: the HTML renderer inlines them, and apps can import style.css.
  const style = document.querySelector("style[data-comark-code],link[data-comark-code]")
    ? null
    : document.createElement("style");
  if (style) {
    style.setAttribute("data-comark-code", "");
    style.textContent = css;
    document.head.append(style);
  }
  document.documentElement.setAttribute("data-code-ready", "");

  const say = (root: Element, message: string, state: "done" | "failed") => {
    const button = root.querySelector(":scope>.ck-bar>.ck-copy");
    const status = root.querySelector(":scope>.ck-bar>.ck-status");
    if (!button || !status) return;
    button.setAttribute("data-state", state);
    status.textContent = message;
    setTimeout(
      () => {
        if (status.textContent !== message) return;
        button.removeAttribute("data-state");
        status.textContent = "";
      },
      state === "done" ? 1500 : 6000,
    );
  };

  // Without clipboard access, on a page served over plain http or in a frame that isn't allowed it, the code is
  // selected instead, so the reader's own copy keys take it.
  function copy(root: Element, code: Element) {
    const text = code.textContent ?? "";
    const failed = () => {
      const range = document.createRange();
      range.selectNodeContents(code);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(range);
      say(root, "Couldn't copy, so the code is selected. Press Ctrl+C or ⌘C.", "failed");
    };
    // SAFETY: `clipboard` is missing outside secure contexts, whatever the DOM types say.
    const clipboard = navigator.clipboard as Clipboard | undefined;
    if (!clipboard) failed();
    else clipboard.writeText(text).then(() => say(root, "Copied", "done"), failed);
  }

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(".ck>.ck-bar>button")
          : null;
      const root = button?.parentElement?.parentElement;
      const pre = root?.querySelector(":scope>pre");
      if (!button || !root || !pre) return;
      const code = pre.querySelector("code") ?? pre;
      if (button.classList.contains("ck-copy")) copy(root, code);
      else if (button.classList.contains("ck-wrap")) {
        const wrap = !root.hasAttribute("data-code-wrap");
        root.toggleAttribute("data-code-wrap", wrap);
        button.setAttribute("aria-pressed", String(wrap));
      } else {
        const detail: CodeActionDetail = {
          action: button.getAttribute("data-code-action") ?? "",
          code: code.textContent ?? "",
          language: pre.getAttribute("data-language") ?? pre.getAttribute("language") ?? "",
        };
        root.dispatchEvent(new CustomEvent("comark-code-action", { bubbles: true, detail }));
      }
    },
    { signal },
  );

  const state = {
    users: 1,
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      style?.remove();
      document.documentElement.removeAttribute("data-code-ready");
      window.__comarkCode = undefined;
    },
  };
  window.__comarkCode = state;
  return state.stop;
}

const escape = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

const icon = (name: string, path: string) =>
  `<svg class="ck-${name}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

/**
 * The inside of a block's button bar, the same in every renderer: your actions, then Wrap and Copy, then the status
 * line that says whether the copy worked. Hidden until the script starts, since nothing works without it.
 */
export function buttons(actions: unknown): string {
  // SAFETY: the parse plugin is the only writer of `actions`, always as `{ id, label }` strings.
  const own = (Array.isArray(actions) ? (actions as ActionButton[]) : []).map(
    (action) =>
      `<button type="button" class="ck-action" data-code-action="${escape(`${action.id}`)}">${escape(`${action.label}`)}</button>`,
  );
  return (
    own.join("") +
    `<button type="button" class="ck-wrap" aria-label="Wrap lines" aria-pressed="false" title="Wrap lines">` +
    icon(
      "wrap-icon",
      '<path d="m16 16-3 3 3 3"/><path d="M3 12h14.5a1 1 0 0 1 0 7H13"/><path d="M3 19h6"/><path d="M3 5h18"/>',
    ) +
    `</button><button type="button" class="ck-copy" aria-label="Copy code" title="Copy">` +
    icon(
      "copy-idle",
      '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    ) +
    icon("copy-done", '<path d="M20 6 9 17l-5-5"/>') +
    `</button><span class="ck-status" role="status"></span>`
  );
}

export { css } from "./styles.ts";

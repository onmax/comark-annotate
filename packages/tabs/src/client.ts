declare global {
  interface Window {
    __comarkTabs?: { users: number; stop: () => void; restore: () => void };
  }
}

/**
 * Starts every `.ct` tab strip on the page and returns a function that stops it. Every caller shares one set of
 * listeners, which stop with the last caller. The function is self-contained: the HTML renderer inlines its source as
 * a script, so it must not use anything from outside its body.
 */
export function start(css: string): () => void {
  const running = window.__comarkTabs;
  if (running) {
    running.users++;
    running.restore();
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;
  // The page may already carry the styles: the HTML renderer inlines them, and apps can import style.css.
  const style = document.querySelector("style[data-comark-tabs],link[data-comark-tabs]")
    ? null
    : document.createElement("style");
  if (style) {
    style.setAttribute("data-comark-tabs", "");
    style.textContent = css;
    document.head.append(style);
  }
  document.documentElement.setAttribute("data-tabs-ready", "");

  // Only the block's own parts: a panel can hold tabs of its own.
  const tabsOf = (root: Element) => [
    ...root.querySelectorAll<HTMLElement>(":scope>.ct-list>[role=tab]"),
  ];
  const panelsOf = (root: Element) => [...root.querySelectorAll(":scope>.ct-panel")];
  const label = (tab: Element) => tab.textContent?.trim() ?? "";

  function select(root: Element, index: number) {
    for (const [at, tab] of tabsOf(root).entries()) {
      tab.setAttribute("aria-selected", String(at === index));
      tab.tabIndex = at === index ? 0 : -1;
    }
    for (const [at, panel] of panelsOf(root).entries())
      panel.toggleAttribute("data-inactive", at !== index);
  }
  const selectLabel = (root: Element, name: string) => {
    const index = tabsOf(root).findIndex((tab) => label(tab) === name);
    if (index >= 0) select(root, index);
  };

  // Storage can throw, in a sandboxed frame or with cookies blocked; the tabs still switch without it.
  const key = (sync: string) => `comark-tabs:${sync}`;
  const current = new Map<string, string>();
  const read = (sync: string) => {
    try {
      const saved = localStorage.getItem(key(sync));
      if (saved !== null) return saved;
    } catch {}
    return current.get(sync) ?? null;
  };
  const synced = (sync: string) =>
    document.querySelectorAll(`.ct[data-tabs-sync="${CSS.escape(sync)}"]`);

  const restore = (node: ParentNode = document) => {
    const roots = [...node.querySelectorAll(".ct[data-tabs-sync]")];
    if (node instanceof Element && node.matches(".ct[data-tabs-sync]")) roots.unshift(node);
    for (const root of roots) {
      const saved = read(root.getAttribute("data-tabs-sync") ?? "");
      if (saved !== null) selectLabel(root, saved);
    }
  };
  restore();
  // The HTML renderer inlines the script after the first tabs, so the page's later tabs arrive after it.
  const added = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) if (node instanceof Element) restore(node);
  });
  added.observe(document.documentElement, { childList: true, subtree: true });

  function activate(tab: HTMLElement, focus: boolean) {
    const root = tab.parentElement?.parentElement;
    if (!root?.matches(".ct")) return;
    const sync = root.getAttribute("data-tabs-sync");
    if (sync) {
      // Switching tabs above the reader changes their height, so the page scrolls by as much to keep this tab still.
      const before = tab.getBoundingClientRect().top;
      for (const other of synced(sync)) selectLabel(other, label(tab));
      select(root, tabsOf(root).indexOf(tab));
      window.scrollBy({ top: tab.getBoundingClientRect().top - before, behavior: "instant" });
      const selected = label(tab);
      current.set(sync, selected);
      try {
        localStorage.setItem(key(sync), selected);
      } catch {}
    } else select(root, tabsOf(root).indexOf(tab));
    if (focus) tab.focus();
  }

  const tabOf = (event: Event) =>
    event.target instanceof Element
      ? event.target.closest<HTMLElement>(".ct>.ct-list>[role=tab]")
      : null;

  document.addEventListener(
    "click",
    (event) => {
      const tab = tabOf(event);
      if (tab) activate(tab, false);
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      const tab = tabOf(event);
      if (!tab || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const root = tab.parentElement?.parentElement;
      const tabs = root ? tabsOf(root) : [];
      const at = tabs.indexOf(tab);
      const back = getComputedStyle(tab).direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      const forward = back === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
      const to =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : event.key === forward
              ? (at + 1) % tabs.length
              : event.key === back
                ? (at - 1 + tabs.length) % tabs.length
                : -1;
      const next = tabs[to];
      if (!next) return;
      event.preventDefault();
      activate(next, true);
    },
    { signal },
  );

  const state = {
    users: 1,
    restore: () => restore(),
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      added.disconnect();
      style?.remove();
      document.documentElement.removeAttribute("data-tabs-ready");
      window.__comarkTabs = undefined;
    },
  };
  window.__comarkTabs = state;
  return state.stop;
}

export { css } from "./styles.ts";

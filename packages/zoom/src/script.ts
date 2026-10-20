/** What `comark-zoom:open` and `comark-zoom:change` carry, so a host can add its own UI to the zoomed view. */
export interface ZoomDetail {
  dialog: HTMLElement;
  header: HTMLElement;
  /** A layer over the zoomed content, sized to it. Draw pins or outlines here. */
  layer: HTMLElement;
  footer: HTMLElement;
  /** The zoomed copy of the item. */
  content: HTMLElement;
  /** The item on the page that is shown. */
  item: HTMLElement;
  index: number;
  items: HTMLElement[];
}

declare global {
  interface Window {
    __comarkZoom?: { users: number; stop: () => void; watch: () => void };
  }
  // The events bubble, so `document` and `window` hear them too.
  interface GlobalEventHandlersEventMap {
    "comark-zoom:open": CustomEvent<ZoomDetail>;
    "comark-zoom:change": CustomEvent<ZoomDetail>;
    "comark-zoom:close": CustomEvent<{ item: HTMLElement }>;
  }
}

/**
 * The zoom script behind `start()`, which passes it the bundled styles. It is self-contained: the HTML renderer inlines
 * its source as a script, so it must not use anything from outside its body.
 */
export function script(css: string): () => void {
  const running = window.__comarkZoom;
  if (running) {
    running.users++;
    running.watch();
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;

  // The page may already carry the styles: the HTML renderer inlines them, and apps can import style.css.
  const style = document.querySelector("style[data-comark-zoom],link[data-comark-zoom]")
    ? null
    : document.createElement("style");
  if (style) {
    style.setAttribute("data-comark-zoom", "");
    style.textContent = css;
    document.head.append(style);
  }

  const SELECTOR = "[data-zoom]";
  const INTERACTIVE = "a,button,input,textarea,select,summary,label,video,audio";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const easing = "cubic-bezier(.22,1,.36,1)";

  type View = {
    dialog: HTMLElement;
    header: HTMLElement;
    title: HTMLElement;
    count: HTMLElement;
    stage: HTMLElement;
    footer: HTMLElement;
    frame: HTMLElement;
    items: HTMLElement[];
    index: number;
    scale: number;
    returnFocus: Element | null;
    pushed: boolean;
    closing: boolean;
    pressed: EventTarget | null;
  };
  let view: View | null = null;
  let restoration: ScrollRestoration | null = null;

  const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    attrs: Record<string, string> = {},
  ) => {
    const node = document.createElement(tag);
    node.className = className;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };

  // A zoomable item inside another one zooms with it.
  function outermost(node: HTMLElement) {
    let item = node;
    for (
      let up = item.parentElement?.closest<HTMLElement>(SELECTOR);
      up;
      up = up.parentElement?.closest<HTMLElement>(SELECTOR)
    )
      item = up;
    return item;
  }

  // An item inside another one zooms with it, so only the outer one is a tab stop. Renderers can't know: a slide and
  // the screenshot inside it come from different plugins.
  function settle() {
    for (const node of document.querySelectorAll<HTMLElement>(SELECTOR))
      if (node.parentElement?.closest(SELECTOR)) node.removeAttribute("tabindex");
  }

  // A named group spans the page. A gallery (a carousel, a comparison) groups the zoomable items inside it. Hidden
  // items, such as those in a closed tab, have no size to zoom from.
  function groupOf(item: HTMLElement): HTMLElement[] {
    const group = item.getAttribute("data-zoom-group");
    const gallery = item.closest("[data-zoom-gallery]");
    const nodes = group
      ? document.querySelectorAll<HTMLElement>(`[data-zoom-group="${CSS.escape(group)}"]`)
      : gallery?.querySelectorAll<HTMLElement>(SELECTOR);
    if (!nodes) return [item];
    return [...nodes].filter((node) => {
      if (node === item) return true;
      const { width, height } = node.getBoundingClientRect();
      return outermost(node) === node && !node.closest(".cz-dialog") && (width > 0 || height > 0);
    });
  }

  function titleOf(item: HTMLElement) {
    return (
      item.getAttribute("data-zoom-title") ||
      item.getAttribute("alt") ||
      item.querySelector("img")?.getAttribute("alt") ||
      // A slide's label is its position, which the counter already shows.
      (item.getAttribute("aria-roledescription") === "slide"
        ? ""
        : item.getAttribute("aria-label")) ||
      ""
    );
  }

  // A copy that can't open another zoom, steal focus, or repeat an id from the page.
  function strip(node: HTMLElement) {
    for (const part of [node, ...node.querySelectorAll<HTMLElement>("*")]) {
      for (const name of [
        "id",
        "data-zoom",
        "data-zoom-group",
        "data-zoom-context",
        "tabindex",
        "aria-haspopup",
      ])
        part.removeAttribute(name);
    }
    node.style.visibility = "";
    node.style.margin = "0";
    return node;
  }

  // The text styles that set a copy's size. Without the page's it would take the dialog's, reflow to another height,
  // and jump when the original takes its place at the end of the closing animation. Color stays the dialog's, which
  // matches its backdrop.
  const INHERITED = [
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "letter-spacing",
    "text-align",
  ];

  // The browser reports line-height in pixels, whether the page set a ratio, which text of another size inside the
  // item scales by, or a length, which it keeps. Text at twice the size tells them apart.
  function lineHeight(parent: HTMLElement, page: CSSStyleDeclaration) {
    const size = parseFloat(page.fontSize);
    if (page.lineHeight === "normal" || !size) return page.lineHeight;
    const probe = el("span", "");
    probe.style.cssText = `position:absolute;visibility:hidden;font-size:${size * 2}px`;
    parent.append(probe);
    const scaled = getComputedStyle(probe).lineHeight !== page.lineHeight;
    probe.remove();
    return scaled ? String(parseFloat(page.lineHeight) / size) : page.lineHeight;
  }

  // `data-zoom-context` names an ancestor whose classes and styles the item needs, such as the figure that carries a
  // screenshot's colors. The copy goes inside an empty copy of it.
  function copy(item: HTMLElement, into: HTMLElement) {
    // SAFETY: a deep clone of an HTMLElement is an HTMLElement of the same kind.
    const clone = strip(item.cloneNode(true) as HTMLElement);
    const selector = item.getAttribute("data-zoom-context");
    const context = selector ? item.parentElement?.closest<HTMLElement>(selector) : null;
    const parent = (context ?? item).parentElement;
    if (parent) {
      const page = getComputedStyle(parent);
      for (const name of INHERITED) into.style.setProperty(name, page.getPropertyValue(name));
      into.style.lineHeight = lineHeight(parent, page);
    }
    if (!context) return into.append(clone);
    // SAFETY: a shallow clone of an HTMLElement is an HTMLElement of the same kind.
    const shell = strip(context.cloneNode(false) as HTMLElement);
    shell.style.color = "inherit";
    shell.append(clone);
    into.append(shell);
  }

  function measure(item: HTMLElement) {
    const rect = item.getBoundingClientRect();
    return { width: rect.width || 1, height: rect.height || 1, rect };
  }

  function detail(current: View): ZoomDetail {
    return {
      dialog: current.dialog,
      header: current.header,
      footer: current.footer,
      layer: current.frame.querySelector<HTMLElement>(".cz-layer")!,
      // SAFETY: render() always puts the zoomed copy first in the frame.
      content: current.frame.firstElementChild as HTMLElement,
      item: current.items[current.index]!,
      index: current.index,
      items: current.items,
    };
  }

  // The zoomed copy keeps the item's width on the page and scales to fill the stage, so text stays sharp. Its height is
  // its own, which grows when an image in it loads after the page's. An image stops at its natural size, past which it
  // would blur.
  function place(current: View) {
    const item = current.items[current.index]!;
    const { width } = measure(item);
    current.frame.style.width = `${width}px`;
    const height = current.frame.offsetHeight || 1;
    const box = current.stage.getBoundingClientRect();
    const natural =
      item instanceof HTMLImageElement && item.naturalWidth && !item.hasAttribute("data-zoom-src")
        ? Math.max(1, item.naturalWidth / width)
        : 4;
    current.scale = Math.max(
      0.1,
      Math.min((box.width * 0.92) / width, (box.height * 0.92) / height, natural, 4),
    );
    current.frame.style.transform = `scale(${current.scale})`;
  }

  // The page's image stays in the copy until the larger file has loaded, so the zoom never grows an empty box.
  function enlarge(image: HTMLImageElement) {
    const large = image.getAttribute("data-zoom-src");
    if (!large) return;
    const preload = new Image();
    preload.addEventListener("load", () => {
      // A srcset, or a picture's sources, would win over src.
      for (const source of image.closest("picture")?.querySelectorAll("source") ?? [])
        source.remove();
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      image.src = large;
    });
    preload.src = large;
  }

  // The move that puts the copy, at scale 1, over the item. It aims at the copy's center rather than the frame's,
  // since margins inside the copy can sit in the frame but outside the item on the page.
  function travel(current: View, item: HTMLElement) {
    const center = (node: Element) => {
      const rect = node.getBoundingClientRect();
      return [rect.left + rect.width / 2, rect.top + rect.height / 2] as const;
    };
    const [fx, fy] = center(current.frame);
    const [cx, cy] = center(current.frame.firstElementChild!);
    const [tx, ty] = center(item);
    return `translate(${tx - fx - (cx - fx) / current.scale}px, ${ty - fy - (cy - fy) / current.scale}px)`;
  }

  function render(current: View) {
    const item = current.items[current.index]!;
    current.frame.replaceChildren();
    copy(item, current.frame);
    current.frame.append(el("div", "cz-layer"));
    for (const image of current.frame.querySelectorAll("img")) {
      image.loading = "eager";
      image.addEventListener("load", () => view === current && !current.closing && place(current));
      enlarge(image);
    }
    current.title.textContent = titleOf(item);
    current.count.textContent =
      current.items.length > 1 ? `${current.index + 1} / ${current.items.length}` : "";
    current.dialog.setAttribute("aria-label", titleOf(item) || "Zoomed view");
    for (const [index, thumb] of [...current.footer.querySelectorAll(".cz-thumb")].entries())
      thumb.setAttribute("aria-current", String(index === current.index));
    place(current);
  }

  function thumbs(current: View) {
    if (current.items.length < 2) return;
    const strip = el("div", "cz-strip", { role: "group", "aria-label": "Items" });
    for (const [index, item] of current.items.entries()) {
      const thumb = el("button", "cz-thumb", {
        type: "button",
        "aria-label": titleOf(item) || `Item ${index + 1}`,
      });
      const { width, height } = measure(item);
      const inner = el("div", "");
      inner.style.width = `${width}px`;
      inner.style.transform = `scale(${Math.min(96 / width, 64 / height)})`;
      copy(item, inner);
      thumb.append(inner);
      thumb.addEventListener("click", () => go(index));
      strip.append(thumb);
    }
    current.footer.append(strip);
  }

  function go(index: number) {
    if (!view || view.closing) return;
    view.items[view.index]!.style.visibility = "";
    view.index = (index + view.items.length) % view.items.length;
    view.items[view.index]!.style.visibility = "hidden";
    render(view);
    view.items[view.index]!.dispatchEvent(
      new CustomEvent("comark-zoom:change", { bubbles: true, detail: detail(view) }),
    );
  }

  // Locking scroll hides the page's scrollbar, which would widen the page and shift it sideways. Keep its space
  // reserved while the zoom is open, and touch nothing when the page has no classic scrollbar.
  const root = document.documentElement;
  let unlocked: { overflow: string; gutter: string; padding: string } | null = null;

  function lock() {
    // A smooth scroll still under way would carry on once the zoom closes and move the item away from the copy that
    // is flying back to it. Stop it where it is.
    scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    const scrollbar = innerWidth - root.clientWidth;
    unlocked = {
      overflow: root.style.overflow,
      gutter: root.style.scrollbarGutter,
      padding: root.style.paddingRight,
    };
    if (scrollbar > 0) {
      if (CSS.supports("scrollbar-gutter", "stable")) root.style.scrollbarGutter = "stable";
      else
        root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`;
    }
    root.style.overflow = "hidden";
  }

  function unlock() {
    if (!unlocked) return;
    root.style.overflow = unlocked.overflow;
    root.style.scrollbarGutter = unlocked.gutter;
    root.style.paddingRight = unlocked.padding;
    unlocked = null;
  }

  function open(item: HTMLElement) {
    if (view) return;
    const items = groupOf(item);
    const dialog = el("div", "cz-dialog", { role: "dialog", "aria-modal": "true", tabindex: "-1" });
    const header = el("div", "cz-header");
    const title = el("span", "cz-title");
    const count = el("span", "cz-count");
    const close = el("button", "cz-close", { type: "button", "aria-label": "Close" });
    close.textContent = "✕";
    header.append(title, count, close);
    const stage = el("div", "cz-stage");
    const frame = el("div", "cz-item");
    stage.append(frame);
    const footer = el("div", "cz-footer");
    const backdrop = el("div", "cz-backdrop");
    dialog.append(backdrop, header, stage, footer);
    const current: View = {
      dialog,
      header,
      title,
      count,
      stage,
      footer,
      frame,
      items,
      index: Math.max(0, items.indexOf(item)),
      scale: 1,
      returnFocus: document.activeElement,
      pushed: false,
      closing: false,
      pressed: null,
    };
    if (items.length > 1) {
      for (const [name, step, label] of [
        ["cz-prev", -1, "Previous"],
        ["cz-next", 1, "Next"],
      ] as const) {
        const button = el("button", `cz-nav ${name}`, { type: "button", "aria-label": label });
        button.textContent = step < 0 ? "‹" : "›";
        button.addEventListener("click", () => go(current.index + step));
        stage.append(button);
      }
    }
    view = current;
    thumbs(current);
    document.body.append(dialog);
    lock();
    render(current);
    close.addEventListener("click", () => void shut());
    // A click around the content closes it. A drag that starts on the content and ends outside does not.
    dialog.addEventListener("pointerdown", (event) => (current.pressed = event.target));
    dialog.addEventListener("click", (event) => {
      const around = event.target === stage || event.target === backdrop;
      if (around && current.pressed === event.target) void shut();
    });
    dialog.focus({ preventScroll: true });

    // Back closes the zoom, like a photo viewer. A frame with an opaque origin can't push history; Escape still works.
    // Going back would also restore the scroll position saved when the zoom opened, and the page may have moved since,
    // when the click landed during a smooth scroll; the page stays where it is instead.
    // The setting belongs to each history entry, so it goes on the page's entry before the zoom's is pushed.
    try {
      restoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      history.pushState({ ...history.state, comarkZoom: true }, "");
      current.pushed = true;
    } catch {
      if (restoration) history.scrollRestoration = restoration;
      restoration = null;
    }

    const shown = items[current.index]!;
    if (!motion.matches) {
      frame.animate(
        [
          {
            transform: `${travel(current, shown)} scale(1)`,
          },
          { transform: `scale(${current.scale})` },
        ],
        { duration: 260, easing },
      );
      for (const part of [backdrop, header, footer])
        part.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    }
    shown.style.visibility = "hidden";
    shown.dispatchEvent(
      new CustomEvent("comark-zoom:open", { bubbles: true, detail: detail(current) }),
    );
  }

  async function shut(fromHistory = false) {
    const current = view;
    if (!current || current.closing) return;
    current.closing = true;
    if (current.pushed && !fromHistory && history.state?.comarkZoom) history.back();
    const item = current.items[current.index]!;
    if (!motion.matches) {
      // A close can come while the opening animation still runs. Measure the frame where it settles, so the path back
      // ends on the item, and start from where it is now.
      const now = getComputedStyle(current.frame).transform;
      for (const animation of current.frame.getAnimations()) animation.cancel();
      const to = item.getBoundingClientRect();
      const visible = to.bottom > 0 && to.top < innerHeight;
      const animations = [
        ...current.dialog.querySelectorAll<HTMLElement>(
          ".cz-backdrop,.cz-header,.cz-footer,.cz-nav",
        ),
      ].map((part) =>
        part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" }),
      );
      animations.push(
        current.frame.animate(
          visible
            ? [{ transform: now }, { transform: `${travel(current, item)} scale(1)` }]
            : [{ opacity: 1 }, { opacity: 0 }],
          { duration: 200, easing, fill: "forwards" },
        ),
      );
      await Promise.all(animations.map((animation) => animation.finished.catch(() => {})));
    }
    for (const node of current.items) node.style.visibility = "";
    current.dialog.remove();
    unlock();
    view = null;
    if (current.returnFocus instanceof HTMLElement)
      current.returnFocus.focus({ preventScroll: true });
    item.dispatchEvent(new CustomEvent("comark-zoom:close", { bubbles: true, detail: { item } }));
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const found = target?.closest<HTMLElement>(SELECTOR);
      const item = found && outermost(found);
      if (!item || item.closest(".cz-dialog") || event.defaultPrevented) return;
      // Links and controls inside a zoomable block keep working.
      const control = target?.closest(INTERACTIVE);
      if (control && control !== item && item.contains(control)) return;
      if (!getSelection()?.isCollapsed) return;
      event.preventDefault();
      open(item);
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (!view) {
        const item =
          event.target instanceof HTMLElement && event.target.matches(SELECTOR)
            ? outermost(event.target)
            : null;
        if (item && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          open(item);
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        void shut();
      } else if (event.key === "ArrowLeft" && view.items.length > 1) go(view.index - 1);
      else if (event.key === "ArrowRight" && view.items.length > 1) go(view.index + 1);
      else if (event.key === "Tab") {
        // Keep focus in the dialog.
        const focusable = [
          ...view.dialog.querySelectorAll<HTMLElement>(
            "button,[href],[tabindex]:not([tabindex='-1'])",
          ),
        ];
        if (!focusable.length) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === view.dialog)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    { signal },
  );

  addEventListener(
    "popstate",
    () => {
      // The browser restores scroll after this event, so put the setting back once it has skipped that.
      const saved = restoration;
      restoration = null;
      if (saved) setTimeout(() => (history.scrollRestoration = saved));
      void shut(true);
    },
    { signal },
  );
  addEventListener("resize", () => view && place(view), { signal });

  // The HTML renderer's script runs where the first item is, before the rest of the page has loaded.
  settle();
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", settle, { once: true, signal });

  const state = {
    users: 1,
    // A component that mounts later starts zoom again, with new items on the page.
    watch: settle,
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      style?.remove();
      void shut();
      window.__comarkZoom = undefined;
    },
  };
  window.__comarkZoom = state;
  return state.stop;
}

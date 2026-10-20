declare global {
  interface Window {
    __comarkCarousel?: { users: number; stop: () => void; watch: () => void };
  }
}

/**
 * Starts the arrows, dots, and keys of every `.cc` carousel on the page and returns a function that stops them. Every
 * caller shares one set of listeners, which stop with the last caller. The function is self-contained: the HTML
 * renderer inlines its source as a script, so it must not use anything from outside its body.
 */
export function start(css: string): () => void {
  const running = window.__comarkCarousel;
  if (running) {
    running.users++;
    running.watch();
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;
  // The page may already carry the styles: the HTML renderer inlines them, and apps can import style.css.
  const style = document.querySelector("style[data-comark-carousel],link[data-comark-carousel]")
    ? null
    : document.createElement("style");
  if (style) {
    style.setAttribute("data-comark-carousel", "");
    style.textContent = css;
    document.head.append(style);
  }
  document.documentElement.setAttribute("data-carousel-ready", "");

  const parts = (root: Element) => {
    const track = root.querySelector<HTMLElement>(":scope>.cc-track");
    const slides = track ? [...track.querySelectorAll<HTMLElement>(":scope>.cc-slide")] : [];
    return { track, slides };
  };

  function current(root: Element) {
    const { track, slides } = parts(root);
    if (!track || !slides.length) return 0;
    const offsets = slides.map((slide) => Math.abs(slide.offsetLeft - track.scrollLeft));
    return offsets.indexOf(Math.min(...offsets));
  }

  function show(root: Element, index: number, behavior: ScrollBehavior = "smooth") {
    const { track, slides } = parts(root);
    const slide = slides[Math.max(0, Math.min(index, slides.length - 1))];
    if (track && slide) track.scrollTo({ left: slide.offsetLeft, behavior });
  }

  function sync(root: Element) {
    const { track, slides } = parts(root);
    if (!track) return;
    const index = current(root);
    for (const [at, dot] of [...root.querySelectorAll(".cc-dot")].entries())
      dot.setAttribute("aria-current", String(at === index));
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    const prev = root.querySelector<HTMLButtonElement>(".cc-step[data-carousel-step='-1']");
    const next = root.querySelector<HTMLButtonElement>(".cc-step[data-carousel-step='1']");
    if (prev) prev.disabled = track.scrollLeft < 2;
    if (next) next.disabled = end || index >= slides.length - 1;
  }

  // A carousel in a hidden tab or a closed details measures 0 wide, which reads as the last slide. Each track syncs
  // when it's first observed and whenever its size changes, including when it's shown.
  const resized = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const root = entry.target.closest(".cc");
      if (root) sync(root);
    }
  });
  const watch = () => {
    for (const track of document.querySelectorAll(".cc>.cc-track")) resized.observe(track);
  };
  watch();

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-carousel-step],[data-carousel-to]")
          : null;
      const root = button?.closest(".cc");
      if (!button || !root) return;
      const to = button.getAttribute("data-carousel-to");
      show(
        root,
        to === null
          ? current(root) + Number(button.getAttribute("data-carousel-step"))
          : Number(to),
      );
    },
    { signal },
  );

  // Scroll events don't bubble, but a capturing listener on the document still sees every track.
  document.addEventListener(
    "scroll",
    (event) => {
      const root =
        event.target instanceof Element && event.target.matches(".cc-track")
          ? event.target.closest(".cc")
          : null;
      if (root) sync(root);
    },
    { capture: true, passive: true, signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // The zoomed view pages with the same keys.
      if (document.querySelector(".cz-dialog")) return;
      const target = event.target instanceof Element ? event.target : null;
      const root = target?.closest(".cc");
      if (!root || target?.closest("input,textarea,select,[contenteditable]")) return;
      event.preventDefault();
      show(root, current(root) + (event.key === "ArrowLeft" ? -1 : 1));
    },
    { signal },
  );

  // Paging in the zoomed view moves the carousel too, so closing it lands on the slide that was shown.
  const follow = (event: Event) => {
    const slide =
      event.target instanceof Element ? event.target.closest<HTMLElement>(".cc-slide") : null;
    const root = slide?.closest(".cc");
    if (!slide || !root) return;
    show(root, parts(root).slides.indexOf(slide), "instant");
    sync(root);
  };
  document.addEventListener("comark-zoom:change", follow, { signal });

  const state = {
    users: 1,
    watch,
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      resized.disconnect();
      style?.remove();
      document.documentElement.removeAttribute("data-carousel-ready");
      window.__comarkCarousel = undefined;
    },
  };
  window.__comarkCarousel = state;
  return state.stop;
}

export { css } from "./styles.ts";

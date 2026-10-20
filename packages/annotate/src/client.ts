declare global {
  interface Window {
    __comarkAnnotate?: { users: number; stop: () => void };
  }
}

/**
 * Starts every `.ca-swipe` slider on the page: a drag anywhere on the pair moves the divider and coasts on release,
 * the handle takes arrow keys, and a click that doesn't drag still zooms. Returns a function that stops it. The
 * function is self-contained: the HTML renderer inlines its source as a script, so it must not use anything from
 * outside its body.
 */
export function start(): () => void {
  const running = window.__comarkAnnotate;
  if (running) {
    running.users++;
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;
  const root = document.documentElement;
  root.setAttribute("data-annotate-ready", "");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  // A press that moves less than this is a click, which zooms.
  const SLOP = 4;

  type Drag = { swipe: HTMLElement; id: number; x: number; moved: boolean; t: number; v: number };
  let drag: Drag | null = null;
  const swallow = new WeakMap<HTMLElement, number>();
  const splits = new WeakMap<HTMLElement, number>();
  const coasting = new WeakMap<HTMLElement, number>();

  const swipeOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>(".ca-swipe") : null;
  const splitOf = (swipe: HTMLElement) =>
    splits.get(swipe) ??
    Number(swipe.querySelector(".ca-handle")?.getAttribute("aria-valuenow") ?? 50);
  const at = (swipe: HTMLElement, x: number) => {
    const box = swipe.getBoundingClientRect();
    return ((x - box.left) / (box.width || 1)) * 100;
  };

  function set(swipe: HTMLElement, value: number) {
    const split = Math.min(100, Math.max(0, value));
    splits.set(swipe, split);
    swipe.style.setProperty("--ca-split", `${split}%`);
    const handle = swipe.querySelector<HTMLElement>(".ca-handle");
    if (!handle) return split;
    const shown = Math.round(split);
    handle.setAttribute("aria-valuenow", String(shown));
    const labels = [...swipe.querySelectorAll(".ca-side .ca-label")].map(
      (label) => label.textContent,
    );
    if (labels.length === 2)
      handle.setAttribute("aria-valuetext", `${labels[0]} ${shown}%, ${labels[1]} ${100 - shown}%`);
    return split;
  }

  function stop(swipe: HTMLElement) {
    cancelAnimationFrame(coasting.get(swipe) ?? 0);
    coasting.delete(swipe);
  }

  // The divider keeps the speed it was let go at and slows to a stop, like a flicked list.
  function coast(swipe: HTMLElement, velocity: number) {
    if (motion.matches || Math.abs(velocity) < 0.02) return;
    let v = Math.max(-0.2, Math.min(velocity, 0.2));
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;
      const before = splitOf(swipe);
      const after = set(swipe, before + v * dt);
      v *= 0.85 ** (dt / 16);
      if (Math.abs(v) < 0.005 || after === 0 || after === 100) return stop(swipe);
      coasting.set(swipe, requestAnimationFrame(step));
    };
    coasting.set(swipe, requestAnimationFrame(step));
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      const swipe = swipeOf(event.target);
      if (!swipe || !event.isPrimary || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("a")) return;
      stop(swipe);
      drag = {
        swipe,
        id: event.pointerId,
        x: event.clientX,
        moved: false,
        t: event.timeStamp,
        v: 0,
      };
    },
    { signal },
  );

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.abs(event.clientX - drag.x) < SLOP) return;
        drag.moved = true;
        drag.swipe.setPointerCapture(drag.id);
        drag.swipe.setAttribute("data-dragging", "");
      }
      const before = splitOf(drag.swipe);
      const after = set(drag.swipe, at(drag.swipe, event.clientX));
      const dt = event.timeStamp - drag.t;
      if (dt > 0) drag.v = 0.8 * ((after - before) / dt) + 0.2 * drag.v;
      drag.t = event.timeStamp;
    },
    { signal },
  );

  const release = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { swipe, moved, v, t } = drag;
    drag = null;
    if (!moved) return;
    swipe.removeAttribute("data-dragging");
    // Keep the compatibility click suppressed until it is actually delivered.
    if (event.type === "pointerup") swallow.set(swipe, (swallow.get(swipe) ?? 0) + 1);
    // A pause before letting go means the reader placed the divider, not flicked it.
    if (event.type === "pointerup" && event.timeStamp - t < 80) coast(swipe, v);
  };
  document.addEventListener("pointerup", release, { signal });
  document.addEventListener("pointercancel", release, { signal });

  // Zoom skips a click that's already handled: the one ending a drag, and any on the handle.
  addEventListener(
    "click",
    (event) => {
      const handle = event.target instanceof Element && event.target.closest(".ca-handle");
      const swipe = swipeOf(event.target);
      if (!swipe) return;
      const pending = swallow.get(swipe) ?? 0;
      // Compatibility clicks generated by touch have detail 0; leave genuine follow-up clicks alone.
      if (!handle && (pending === 0 || event.detail !== 0)) return;
      if (!handle && pending > 0) swallow.set(swipe, pending - 1);
      event.preventDefault();
    },
    { capture: true, signal },
  );

  // Firefox drags the image out of the page otherwise.
  document.addEventListener(
    "dragstart",
    (event) => {
      if (swipeOf(event.target)) event.preventDefault();
    },
    { signal },
  );

  const KEYS = new Map<string, (split: number) => number>([
    ["ArrowLeft", (split) => split - 5],
    ["ArrowDown", (split) => split - 5],
    ["ArrowRight", (split) => split + 5],
    ["ArrowUp", (split) => split + 5],
    ["PageDown", (split) => split - 25],
    ["PageUp", (split) => split + 25],
    ["Home", () => 0],
    ["End", () => 100],
  ]);
  document.addEventListener(
    "keydown",
    (event) => {
      const move = KEYS.get(event.key);
      const handle = event.target instanceof Element ? event.target.closest(".ca-handle") : null;
      const swipe = swipeOf(handle);
      if (!move || !swipe) return;
      event.preventDefault();
      stop(swipe);
      set(swipe, move(splitOf(swipe)));
    },
    { signal },
  );

  const state = {
    users: 1,
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      root.removeAttribute("data-annotate-ready");
      window.__comarkAnnotate = undefined;
    },
  };
  window.__comarkAnnotate = state;
  return state.stop;
}

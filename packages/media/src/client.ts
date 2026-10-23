declare global {
  interface Window {
    __comarkMedia?: { users: number; stop: () => void; sync: () => void };
  }
}

const icon = (name: string, paths: string, fill: boolean) =>
  `<svg class="cm-icon-${name}" viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const speaker =
  '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>';

/**
 * The audio player's controls, the same in every renderer. They show once the script runs; until then, and when the
 * file can't play, the browser's own player shows instead.
 */
export const controls =
  `<button type="button" class="cm-play" aria-label="Play">${icon("play", '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 6 4.5z"/>', true)}${icon("pause", '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>', true)}</button>` +
  '<span class="cm-time">0:00</span><input type="range" class="cm-seek" min="0" max="0" step="any" value="0" aria-label="Seek"><span class="cm-time">0:00</span>' +
  `<button type="button" class="cm-mute" aria-label="Mute">${icon("volume", `${speaker}<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>`, false)}${icon("muted", `${speaker}<path d="m22 9-6 6"/><path d="m16 9 6 6"/>`, false)}</button>`;

/**
 * Adds the styles and starts every `.cm-audio` player on the page, and returns a function that stops them. Every caller
 * shares one set of listeners on the document, which stop with the last caller; a player added later starts when its
 * file's length loads. The
 * function is self-contained: the HTML renderer inlines its source as a script, so it must not use anything from
 * outside its body.
 */
export function start(css: string): () => void {
  const running = window.__comarkMedia;
  if (running) {
    running.users++;
    running.sync();
    return running.stop;
  }
  const listeners = new AbortController();
  const signal = listeners.signal;
  // The page may already carry the styles: the HTML renderer inlines them, and apps can import style.css.
  const style = document.querySelector("style[data-comark-media],link[data-comark-media]")
    ? null
    : document.createElement("style");
  if (style) {
    style.setAttribute("data-comark-media", "");
    style.textContent = css;
    document.head.append(style);
  }

  const two = (value: number) => String(value).padStart(2, "0");
  const clock = (time: number) => {
    const seconds = Math.floor(time);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    return `${hours ? `${hours}:${two(minutes)}` : minutes}:${two(seconds % 60)}`;
  };
  const playerOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>(".cm-audio") : null;
  const audioOf = (player: Element) => player.querySelector<HTMLAudioElement>(":scope>audio");
  // A stream has no end, so it gets no length and no seeking.
  const length = (audio: HTMLAudioElement) =>
    Number.isFinite(audio.duration) ? audio.duration : 0;

  function draw(player: HTMLElement) {
    const audio = audioOf(player);
    if (!audio) return;
    const total = length(audio);
    const at = Math.min(audio.currentTime, total);
    player.setAttribute("data-media-ready", "");
    player.toggleAttribute("data-playing", !audio.paused);
    player.toggleAttribute("data-muted", audio.muted);
    player.toggleAttribute("data-error", Boolean(audio.error));
    player.querySelector(".cm-play")?.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
    player.querySelector(".cm-mute")?.setAttribute("aria-label", audio.muted ? "Unmute" : "Mute");
    const [now, end] = player.querySelectorAll(".cm-time");
    if (now) now.textContent = clock(at);
    if (end) end.textContent = clock(total);
    const seek = player.querySelector<HTMLInputElement>(".cm-seek");
    if (!seek) return;
    seek.max = String(total);
    seek.value = String(at);
    seek.disabled = !total;
    seek.style.setProperty("--cm-at", `${total ? (at / total) * 100 : 0}%`);
    seek.setAttribute("aria-valuetext", `${clock(at)} of ${clock(total)}`);
  }
  const sync = () => document.querySelectorAll<HTMLElement>(".cm-audio").forEach(draw);

  // Media events don't bubble, but they still pass the document on the way down, so one listener there sees them all.
  const redraw = (event: Event) => {
    const player = playerOf(event.target);
    if (player) draw(player);
  };
  for (const type of [
    "loadedmetadata",
    "durationchange",
    "timeupdate",
    "pause",
    "ended",
    "seeked",
    "volumechange",
    "emptied",
    "error",
  ])
    document.addEventListener(type, redraw, { capture: true, signal });

  document.addEventListener(
    "play",
    (event) => {
      const player = playerOf(event.target);
      if (!player) return;
      // One recording at a time, since two at once can't be followed.
      for (const audio of document.querySelectorAll<HTMLAudioElement>(".cm-audio>audio"))
        if (audio !== event.target) audio.pause();
      // timeupdate fires a few times a second, which makes a short clip's bar jump.
      const frame = () => {
        draw(player);
        if (!signal.aborted && !audioOf(player)?.paused) requestAnimationFrame(frame);
      };
      frame();
    },
    { capture: true, signal },
  );

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element ? event.target.closest(".cm-play,.cm-mute") : null;
      const player = playerOf(button);
      const audio = player && audioOf(player);
      if (!button || !audio) return;
      if (button.classList.contains("cm-mute")) audio.muted = !audio.muted;
      // A refused play leaves the player paused, and a file that can't load shows the browser's player instead.
      else if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    },
    { signal },
  );

  const seekOf = (target: EventTarget | null) =>
    target instanceof HTMLInputElement && target.matches(".cm-audio .cm-seek") ? target : null;
  document.addEventListener(
    "input",
    (event) => {
      const seek = seekOf(event.target);
      const player = playerOf(seek);
      const audio = player && audioOf(player);
      if (!seek || !audio) return;
      audio.currentTime = Number(seek.value);
      draw(player);
    },
    { signal },
  );
  // A range steps by a hundredth of its length or by one second, depending on the browser; a player steps by five,
  // or by a tenth of a short clip.
  document.addEventListener(
    "keydown",
    (event) => {
      const seek = seekOf(event.target);
      const player = playerOf(seek);
      const audio = player && audioOf(player);
      if (!seek || !audio || event.altKey || event.ctrlKey || event.metaKey) return;
      const back = getComputedStyle(seek).direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      const forward = back === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
      const by = Math.min(5, length(audio) / 10);
      if (event.key === back || event.key === "ArrowDown") audio.currentTime -= by;
      else if (event.key === forward || event.key === "ArrowUp") audio.currentTime += by;
      else return;
      event.preventDefault();
      draw(player);
    },
    { signal },
  );

  sync();

  const state = {
    users: 1,
    sync,
    stop: () => {
      if (--state.users > 0) return;
      listeners.abort();
      style?.remove();
      for (const player of document.querySelectorAll(".cm-audio"))
        player.removeAttribute("data-media-ready");
      window.__comarkMedia = undefined;
    },
  };
  window.__comarkMedia = state;
  return state.stop;
}

export { css } from "./styles.ts";

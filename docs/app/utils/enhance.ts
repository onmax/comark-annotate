// The example tabs, the Preview/Code switch, the installer, copy buttons, and the active sidebar link. Without it the page still
// reads top to bottom. Returns a function that undoes it, since the page's elements outlive a client-side navigation.
export function enhance(root: HTMLElement): () => void {
  const listeners = new AbortController();
  const signal = listeners.signal;
  for (const win of root.querySelectorAll<HTMLElement>(".window")) {
    const tabs = [...win.querySelectorAll<HTMLElement>(".window-tabs [role=tab]")];
    const panels = [...win.querySelectorAll<HTMLElement>(".window-body > [role=tabpanel]")];
    const show = (index: number) => {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        panel.toggleAttribute("inert", i !== index);
        panel.toggleAttribute("data-active", i === index);
      });
    };
    win.querySelector(".window-tabs")?.addEventListener(
      "click",
      (event) => {
        const tab = (event.target as Element).closest<HTMLElement>("[role=tab]");
        if (tab) show(tabs.indexOf(tab));
      },
      { signal },
    );
    const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2200;
    const timer = setTimeout(() => show(1), delay);
    signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
  }
  for (const t of root.querySelectorAll<HTMLElement>(".examples"))
    t.querySelector(".tablist")?.addEventListener(
      "click",
      (e) => {
        const b = (e.target as Element).closest<HTMLElement>("[role=tab]");
        if (!b) return;
        for (const x of t.querySelectorAll(":scope > .tablist > [role=tab]"))
          x.setAttribute("aria-selected", String(x === b));
        for (const p of t.querySelectorAll<HTMLElement>(":scope > [role=tabpanel]"))
          p.hidden = p.dataset.tab !== b.dataset.tab;
      },
      { signal },
    );
  for (const ex of root.querySelectorAll<HTMLElement>(".example"))
    ex.querySelector(".seg")?.addEventListener(
      "click",
      (e) => {
        const b = (e.target as Element).closest<HTMLElement>("button");
        if (!b) return;
        for (const x of ex.querySelectorAll(".seg button"))
          x.setAttribute("aria-pressed", String(x === b));
        ex.querySelector<HTMLElement>(".example-preview")!.hidden = b.dataset.view !== "preview";
        ex.querySelector<HTMLElement>(".example-code")!.hidden = b.dataset.view !== "code";
      },
      { signal },
    );
  for (const box of root.querySelectorAll<HTMLElement>(".installer")) {
    const commands = JSON.parse(box.dataset.commands!) as Record<string, string>;
    const field = box.querySelector<HTMLElement>(".install")!;
    let audience = "humans";
    let pm = "pnpm";
    const update = () => {
      const cmd = commands[audience === "agents" ? "agents" : pm]!;
      field.dataset.copy = cmd;
      field.querySelector("code")!.textContent = cmd;
      box.querySelector<HTMLElement>(".installer-pm")!.hidden = audience === "agents";
      for (const b of box.querySelectorAll<HTMLElement>("[data-audience]"))
        b.setAttribute("aria-pressed", String(b.dataset.audience === audience));
      for (const b of box.querySelectorAll<HTMLElement>("[data-pm]"))
        b.setAttribute("aria-pressed", String(b.dataset.pm === pm));
    };
    box.addEventListener(
      "click",
      (e) => {
        const b = (e.target as Element).closest<HTMLElement>("[data-audience],[data-pm]");
        if (!b) return;
        if (b.dataset.audience) audience = b.dataset.audience;
        if (b.dataset.pm) pm = b.dataset.pm;
        update();
      },
      { signal },
    );
    field.addEventListener(
      "click",
      async () => {
        await navigator.clipboard.writeText(field.dataset.copy!);
        field.classList.add("copied");
        setTimeout(() => field.classList.remove("copied"), 1200);
      },
      { signal },
    );
  }
  for (const pre of root.querySelectorAll("pre")) {
    if (pre.querySelector(":scope > .copy")) continue;
    const b = document.createElement("button");
    b.className = "copy";
    b.type = "button";
    b.textContent = "Copy";
    b.onclick = async () => {
      await navigator.clipboard.writeText(pre.querySelector("code")!.innerText.trimEnd());
      b.textContent = "Copied";
      setTimeout(() => (b.textContent = "Copy"), 1500);
    };
    pre.append(b);
  }
  const links = [...root.querySelectorAll<HTMLAnchorElement>(".sidebar a")];
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting)
          for (const a of links) a.toggleAttribute("data-active", a.hash === `#${e.target.id}`);
    },
    { rootMargin: "0px 0px -70% 0px" },
  );
  for (const h of root.querySelectorAll("main h2[id], main h3[id]")) spy.observe(h);
  return () => {
    listeners.abort();
    spy.disconnect();
  };
}

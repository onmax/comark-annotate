// HTML inserted by the client never runs its scripts, so the HTML renderers' inlined zoom, carousel, and annotate
// scripts are run again when an island brings them. The ones in the server's HTML already ran.
export function runScripts(root: HTMLElement, includeExisting: boolean): () => void {
  const run = (old: HTMLScriptElement) => {
    const script = document.createElement("script");
    script.textContent = old.textContent;
    old.replaceWith(script);
    return script;
  };
  const ran = new WeakSet<Node>();
  const scan = (node: Node) => {
    if (!(node instanceof Element)) return;
    for (const script of node.matches("script") ? [node] : node.querySelectorAll("script"))
      if (!ran.has(script)) ran.add(run(script as HTMLScriptElement));
  };
  if (includeExisting) scan(root);
  else for (const script of root.querySelectorAll("script")) ran.add(script);
  const observer = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) if (!ran.has(node)) scan(node);
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}

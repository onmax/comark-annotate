import { createHtmlRenderer } from "@comark/html";
import { parseMarkdown } from "comark";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import chips, { type ChipsOptions, components } from "../src/html.ts";

const PNG = new Uint8Array([137, 80, 78, 71]);
const requests: string[] = [];

// A web with a favicon for every site, an avatar for `onmax`, no account `ghost`, and no network for `offline.dev`.
beforeEach(() => {
  requests.length = 0;
  vi.stubGlobal("fetch", async (input: string) => {
    requests.push(input);
    if (input.includes("offline.dev")) throw new TypeError("fetch failed");
    if (input.includes("/ghost.png")) return new Response("Not Found", { status: 404 });
    return new Response(PNG, { headers: { "content-type": "image/png" } });
  });
});
afterEach(() => vi.unstubAllGlobals());

const render = (markdown: string, options?: ChipsOptions) =>
  createHtmlRenderer({ plugins: [chips(options)], components })(markdown);
const issues = async (markdown: string, options?: ChipsOptions) =>
  (await parseMarkdown(markdown, { plugins: [chips(options)] })).meta.issues;
const DATA = "data:image/png;base64,iVBORw==";

describe("comark-chips", () => {
  it("turns a link into a chip with the site's favicon inlined, and the styles once", async () => {
    const html = await render("Built with [Vite](https://vite.dev) and [Vue](https://vuejs.org).");
    expect(html).toContain(
      `<a class="cp" href="https://vite.dev" data-kind="favicon"><img class="cp-img" src="${DATA}" alt="">Vite</a>`,
    );
    expect(html).toContain('href="https://vuejs.org"');
    expect(html.match(/<style data-comark-chips>/g)).toHaveLength(1);
    expect(requests).toContain("https://www.google.com/s2/favicons?domain=vite.dev&sz=64");
  });

  it("turns @user into a chip with their GitHub avatar, and a link into an account shows it too", async () => {
    const html = await render(
      "Thanks @onmax, see [the repo](https://github.com/onmax/comark-plugins) and [issues](https://github.com/issues).",
    );
    expect(html).toContain(
      `<a class="cp" href="https://github.com/onmax" data-kind="avatar"><img class="cp-img" src="${DATA}" alt="">onmax</a>,`,
    );
    expect(html).toContain(
      `<a class="cp" href="https://github.com/onmax/comark-plugins" data-kind="avatar">`,
    );
    expect(html).toMatch(/href="https:\/\/github.com\/issues" data-kind="favicon"/);
    expect(requests).toContain("https://github.com/onmax.png?size=64");
  });

  it("leaves emails, npm scopes, code, relative links, and links around images alone", async () => {
    const html = await render(
      "Mail me@onmax.dev about `@onmax` and @comark/html, read the [guide](/guide/), see [![logo](https://x.dev/a.png)](https://x.dev).",
    );
    expect(html).not.toContain('class="cp"');
    expect(requests).toEqual([]);
  });

  it("shows a bare URL without its scheme, and an @user link without its @", async () => {
    const html = await render("<https://vite.dev/guide/> by [@onmax](https://github.com/onmax)");
    expect(html).toMatch(/alt="">vite\.dev\/guide<\/a>/);
    expect(html).toMatch(/alt="">onmax<\/a>/);
  });

  it("takes an avatar from the link, keeps a plain link on request, and keeps the title", async () => {
    const html = await render(
      '[Anthony](https://antfu.me "His site"){avatar="@antfu"}, [logo](https://nuxt.com){avatar="https://x.dev/n.png"}, and [plain](https://vite.dev){chip=false}',
    );
    expect(html).toContain(
      '<a class="cp" href="https://antfu.me" data-kind="avatar" title="His site">',
    );
    expect(html).toContain('href="https://nuxt.com" data-kind="avatar"');
    expect(html).toMatch(/<a href="https:\/\/vite.dev">plain<\/a>/);
    expect(requests).toEqual(
      expect.arrayContaining(["https://github.com/antfu.png?size=64", "https://x.dev/n.png"]),
    );
  });

  it("preserves malformed web destinations instead of throwing", async () => {
    const html = await render("[broken](https://)");
    expect(html).toContain('<a href="https://">broken</a>');
    expect(html).not.toContain('class="cp"');
    expect(await issues("[broken](https://)")).toEqual([
      "[broken](https://): `href` must be a valid web address.",
    ]);
  });

  it("does not nest chips when a link wraps an explicit chip", async () => {
    const html = await render('[:chip[y]{href="https://y.dev"}](https://x.dev)');
    expect(html.match(/<a/g)).toHaveLength(1);
    expect(html).toContain('href="https://x.dev"');
    expect(html).toContain(">y</span>");
  });

  it("leaves raw HTML subtrees unchanged", async () => {
    const html = await render("<span>@onmax</span> and @onmax");
    expect(html).toContain("<span>@onmax</span>");
    expect(html.match(/<a class="cp"[^>]*data-kind="avatar"/g)).toHaveLength(1);
  });

  it("draws an inline :chip like a link", async () => {
    const html = await render(':chip[Nuxt]{href="https://nuxt.com"}');
    expect(html).toContain('<a class="cp" href="https://nuxt.com" data-kind="favicon"><img');
    expect(await issues(":chip[Nuxt]")).toEqual([
      '`:chip` [Nuxt](): `href` must be a web address, such as `href="https://vite.dev"`.',
    ]);
  });

  it("leaves an image the browser can't download to the reader, and reports an avatar that doesn't exist", async () => {
    const html = await render("[Offline](https://offline.dev) and @ghost");
    expect(html).toContain(
      'src="https://www.google.com/s2/favicons?domain=offline.dev&amp;sz=64" alt="">Offline</a>',
    );
    expect(html).toMatch(/href="https:\/\/github.com\/ghost" data-kind="avatar">ghost<\/a>/);
    expect(await issues("@ghost")).toEqual([
      "`@ghost`: there's no avatar at https://github.com/ghost.png?size=64 (HTTP 404). Check the GitHub login, or set `avatar` to an image URL.",
    ]);
  });

  it("takes other image sources, and keeps URLs without downloading", async () => {
    const html = await render("[Vite](https://vite.dev) by @onmax", {
      download: false,
      favicon: (host) => `https://icons.example/${host}.ico`,
      avatar: (login) => `https://unavatar.io/github/${login}`,
    });
    expect(html).toContain('src="https://icons.example/vite.dev.ico"');
    expect(html).toContain('src="https://unavatar.io/github/onmax"');
    expect(requests).toEqual([]);
  });
});

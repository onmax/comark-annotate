// The docs moved from comark-annotate.onmax.me to comark.onmax.me/annotate. Old links redirect; the skill, images,
// and fonts keep their paths, so agents that installed the skill from the old address still find it.
const OLD_HOST = "comark-annotate.onmax.me";
const KEEP = /^\/(\.well-known\/|fonts\/)|\.(png|svg|woff2)$/;
// Each package had a page per topic until its pages merged into one; the linter keeps its own, and the guides are
// their own section with a Theming page. The preset's page is Getting started now that it's comark-ui.
const MERGED =
  /^\/(?!lint\/|guide\/)([\w-]+)\/(?:getting-started|syntax|components|guides|theming)\/?$/;
const MOVED: Record<string, string> = {
  "/preset/": "/getting-started/",
  "/preset": "/getting-started/",
};

export default {
  fetch(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }) {
    const url = new URL(request.url);
    if (url.hostname !== OLD_HOST) {
      const merged = MERGED.exec(url.pathname);
      const moved = merged ? `/${merged[1]}/` : MOVED[url.pathname];
      if (moved) return Response.redirect(`https://comark.onmax.me${moved}${url.search}`, 301);
      return env.ASSETS.fetch(request);
    }
    const path = KEEP.test(url.pathname) ? url.pathname : `/annotate${url.pathname}`;
    return Response.redirect(`https://comark.onmax.me${path}${url.search}`, 301);
  },
};

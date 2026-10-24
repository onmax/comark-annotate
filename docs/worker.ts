// The docs moved from comark-annotate.onmax.me to comark.onmax.me/annotate, then to comark-ui.onmax.me. Old links
// redirect; the skill, images, and fonts keep their paths, so agents that installed the skill from an old address still
// find it.
const SITE = "https://comark-ui.onmax.me";
const MOVED: Record<string, string | undefined> = {
  "comark.onmax.me": "",
  "comark-annotate.onmax.me": "/annotate",
};
const KEEP = /^\/(\.well-known\/|fonts\/)|\.(png|svg|woff2)$/;

export default {
  fetch(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }) {
    const url = new URL(request.url);
    const prefix = MOVED[url.hostname];
    if (prefix === undefined) return env.ASSETS.fetch(request);
    const path = KEEP.test(url.pathname) ? url.pathname : `${prefix}${url.pathname}`;
    return Response.redirect(`${SITE}${path}${url.search}`, 301);
  },
};

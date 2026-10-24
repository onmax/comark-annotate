// The docs moved from comark-annotate.onmax.me to comark.onmax.me/annotate. Old links redirect; images and fonts
// keep their paths.
const OLD_HOST = "comark-annotate.onmax.me";
const KEEP = /^\/fonts\/|\.(png|svg|woff2)$/;

export default {
  fetch(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }) {
    const url = new URL(request.url);
    if (url.hostname !== OLD_HOST) return env.ASSETS.fetch(request);
    const path = KEEP.test(url.pathname) ? url.pathname : `/annotate${url.pathname}`;
    return Response.redirect(`https://comark.onmax.me${path}${url.search}`, 301);
  },
};

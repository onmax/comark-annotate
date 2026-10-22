import { getIslandHash } from "#app";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export const slugOf = (route: Pick<RouteLocationNormalizedLoaded, "params">) =>
  [route.params.slug ?? []].flat().filter(Boolean).join("/");

export const slugFromPath = (path: string) => path.replace(/^\//, "").replace(/\/$/, "");

// The key `<PageBody :slug>` stores its island under in the payload, and the name of its prerendered JSON.
export const bodyKey = (slug: string) =>
  `PageBody_${getIslandHash({ name: "PageBody", props: { slug } })}`;

// The path of a link to another docs page, which the app can open without a page load. The catch-all route matches
// any path, so this tells pages from the playground and files, which aren't in the app.
export function docsPath(link: HTMLAnchorElement): string | undefined {
  if (!link.href || link.target || link.hasAttribute("download")) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith("/")) return;
  if (url.pathname.startsWith("/play/")) return;
  return url.pathname;
}

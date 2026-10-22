// The page already holds the body's HTML, and hydration reads it from there. Left in the payload, the island entry
// makes every prefetched `_payload.json` fetch its page's body too, and the header links to every page.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook("app:rendered", () => {
    for (const key of Object.keys(nuxtApp.payload.data))
      if (key.startsWith("PageBody_")) delete nuxtApp.payload.data[key];
  });
});

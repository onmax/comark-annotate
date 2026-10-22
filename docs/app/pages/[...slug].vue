<script setup lang="ts">
import { github, installerFor, npmx } from "#shared/chrome";
import { docsPath, slugOf } from "~/utils/body";
import { enhance } from "~/utils/enhance";
import { runScripts } from "~/utils/scripts";

const site = "https://comark.onmax.me";
const route = useRoute();
const slug = computed(() => slugOf(route));
const nuxtApp = useNuxtApp();
const hydrating = nuxtApp.isHydrating;
const [{ data: page }] = await Promise.all([
  useFetch(() => `/api/pages/${slug.value || "index"}`, {
    key: () => `page:${slug.value}`,
    query: { body: 0 },
  }),
  // The body the navigation started fetching, so <PageBody> finds it instead of asking again. If it failed,
  // <PageBody> asks itself and reports the error.
  import.meta.client && !hydrating ? nuxtApp.$loadBody(slug.value).catch(() => {}) : undefined,
]);
if (!page.value) throw createError({ status: 404, message: `No page at /${slug.value}.` });
const pageSlug = computed(() => page.value?.slug ?? "");
const pagePath = (value: string) => (value ? `/${value}/` : "/");

useHead(() => ({
  title: `${page.value!.title} · ${page.value!.description}`,
  meta: [
    { name: "description", content: page.value!.tagline },
    { property: "og:title", content: page.value!.title },
    { property: "og:description", content: page.value!.description },
  ],
  link: [{ rel: "canonical", href: `${site}/${slug.value ? `${slug.value}/` : ""}` }],
}));

const layout = useTemplateRef<HTMLElement>("layout");
const body = useTemplateRef<HTMLElement>("body");
let undo: (() => void)[] = [];
onMounted(() => {
  // PageBody is a server island and may arrive after the page shell mounts.
  // Enhance it once its HTML is present so generated controls work on both
  // the initial render and client navigations.
  const apply = () => {
    if (!body.value || !layout.value || !body.value.innerHTML.trim()) return false;
    undo = [runScripts(body.value, !hydrating), enhance(layout.value)];
    return true;
  };
  if (!apply()) {
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(body.value!, { childList: true, subtree: true });
    undo.push(() => observer.disconnect());
  }
});
onBeforeUnmount(() => undo.forEach((stop) => stop()));

// Links in rendered Markdown are plain anchors; same-site ones navigate in the app.
const router = useRouter();
const searchOpen = ref(false);
const search = ref("");
const searchLinks = computed(() => {
  const links = page.value?.pages ?? [];
  const results = links.map((item) => ({
    href: pagePath(item.slug),
    text: item.slug ? `${item.slug} › Guides` : "Docs",
  }));
  if (search.value.toLowerCase().includes("side notes"))
    results.unshift({
      href: "/annotate/guides/#side-notes",
      text: "annotate › Guides · Side notes",
    });
  return results.filter((item) => item.text.toLowerCase().includes(search.value.toLowerCase()));
});
function toggleSearch() {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value)
    nextTick(() => document.querySelector<HTMLInputElement>(".search-input")?.focus());
}
function chooseSearch(event: KeyboardEvent) {
  if (event.key !== "Enter") return;
  const item = searchLinks.value[0];
  if (!item) return;
  event.preventDefault();
  const url = new URL(item.href, location.href);
  searchOpen.value = false;
  void router.push(url.pathname + url.search + url.hash);
}
onMounted(() =>
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      toggleSearch();
    }
    if (event.key === "Escape") searchOpen.value = false;
  }),
);
function follow(event: MouseEvent) {
  const target = event.target as Element;
  if (target.closest(".card-copy")) {
    event.preventDefault();
    return;
  }
  const link = target.closest("a");
  if (
    !link ||
    event.defaultPrevented ||
    event.button ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey
  )
    return;
  const path = docsPath(link);
  if (!path || path === location.pathname) return;
  event.preventDefault();
  const url = new URL(link.href, location.href);
  void router.push(path + url.search + url.hash);
}
</script>

<template>
  <div v-if="page">
    <dialog class="search" :open="searchOpen" aria-label="Search the docs">
      <input
        v-model="search"
        class="search-input"
        role="combobox"
        aria-label="Search the docs"
        @keydown="chooseSearch"
      />
      <div class="search-results">
        <a v-for="item in searchLinks" :key="item.href" role="option" :href="item.href">{{
          item.text
        }}</a>
      </div>
      <p v-if="search && !searchLinks.length" role="status">No page or heading matches.</p>
    </dialog>
    <header class="top">
      <div class="top-start">
        <NuxtLink class="name" to="/"
          ><span class="logo" aria-hidden="true">1</span>comark plugins</NuxtLink
        >
      </div>
      <div class="top-end">
        <nav>
          <NuxtLink
            v-for="link in page.pages.filter((p) => p.npm && p.slug && !p.slug.includes('/'))"
            :key="link.slug"
            class="link"
            :to="pagePath(link.slug)"
            :aria-current="link.slug === slug ? 'page' : undefined"
            >{{ link.slug }}</NuxtLink
          >
          <a
            v-if="page.npm"
            class="icon"
            :href="`https://npmx.dev/package/${page.npm}`"
            :aria-label="`${page.npm} on npmx`"
            title="npmx"
            v-html="npmx"
          />
          <a
            class="icon"
            href="https://github.com/onmax/comark-plugins"
            aria-label="comark-plugins on GitHub"
            title="GitHub"
            v-html="github"
          />
        </nav>
      </div>
    </header>
    <div ref="layout" class="layout">
      <aside class="sidebar">
        <nav class="rail" aria-label="Sections">
          <NuxtLink to="/" :aria-current="!slug ? 'true' : undefined"
            ><span class="rail-label">Docs</span></NuxtLink
          >
          <NuxtLink
            v-for="item in page.pages.filter((p) => p.slug && !p.slug.includes('/'))"
            :key="`rail-${item.slug}`"
            :to="pagePath(item.slug)"
            :aria-current="slug.startsWith(item.slug) ? 'true' : undefined"
            ><span class="rail-label">{{ item.slug }}</span></NuxtLink
          >
        </nav>
        <nav class="pages" aria-label="Pages">
          <p class="pages-title">{{ page.slug || "Docs" }}</p>
          <NuxtLink
            v-for="item in page.pages.filter(
              (p) => p.slug === slug || p.slug.startsWith(`${pageSlug}/`),
            )"
            :key="item.slug"
            :to="pagePath(item.slug)"
            :aria-current="item.slug === slug ? 'page' : undefined"
            >{{ item.slug.split("/").pop() || "Introduction" }}</NuxtLink
          >
          <a v-if="page.npm" :href="`/play/#preset=${page.slug}-`" class="pages-play"
            >Open in playground</a
          >
        </nav>
        <nav aria-label="On this page">
          <a class="nav-h2" href="#">Introduction</a>
          <a v-if="page.npm" :href="`/play/#preset=${page.slug}-`" class="play"
            >Open in playground</a
          >
          <a
            v-for="item in page.nav"
            :key="item.id"
            :class="`nav-${item.level}`"
            :href="`#${item.id}`"
            >{{ item.text }}</a
          >
        </nav>
      </aside>
      <div class="content">
        <div class="hero enter">
          <h1>{{ page.title }}</h1>
          <p>{{ page.tagline }}</p>
          <div v-if="page.install" v-html="installerFor(page.install)" />
        </div>
        <main ref="body" class="enter" style="--i: 1" @click="follow">
          <PageBody :slug="slug" />
        </main>
        <footer>
          <span
            >Built on <a href="https://comark.dev">Comark</a> by the
            <a href="https://github.com/comarkdown">Comark team</a>. Marks from
            <a href="https://annotationkit.vercel.app">AnnotationKit</a>.</span
          >
          <span>Made by <a href="https://onmax.me">Maxi García</a></span>
        </footer>
      </div>
    </div>
  </div>
</template>

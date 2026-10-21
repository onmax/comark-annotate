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
onMounted(() => (undo = [runScripts(body.value!, !hydrating), enhance(layout.value!)]));
onBeforeUnmount(() => undo.forEach((stop) => stop()));

// Links in rendered Markdown are plain anchors; same-site ones navigate in the app.
const router = useRouter();
function follow(event: MouseEvent) {
  const link = (event.target as Element).closest("a");
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
    <header class="top">
      <NuxtLink class="name" to="/"
        ><span class="logo" aria-hidden="true">1</span>comark plugins</NuxtLink
      >
      <nav>
        <NuxtLink
          v-for="link in page.pages.filter((p) => p.npm && p.slug && !p.slug.includes('/'))"
          :key="link.slug"
          class="link"
          :to="`/${link.slug}/`"
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
    </header>
    <div ref="layout" class="layout">
      <aside class="sidebar">
        <nav aria-label="On this page">
          <a class="nav-h2" href="#">Introduction</a>
          <a v-if="page.npm" href="/play/" class="play">Open in playground</a>
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

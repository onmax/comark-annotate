<!-- Videos and audio for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { controls, css, start } from "comark-media/client";

  let {
    kind = undefined,
    src = undefined,
    label = undefined,
    poster = undefined,
    autoplay = false,
    loop = false,
    muted = false,
    native = false,
  } = $props();
  onMount(() => start(css));
</script>

{#if kind === "video" && src}
  <video class="cm" {src} controls playsinline preload="metadata" {poster} {autoplay} {loop} {muted} aria-label={label || undefined}><a href={src}>{label || src}</a></video>
{:else if kind === "audio" && src && native}
  <audio class="cm" {src} controls preload="metadata" {autoplay} {loop} {muted} aria-label={label || undefined}><a href={src}>{label || src}</a></audio>
{:else if kind === "audio" && src}
  <span class="cm cm-audio" role={label ? "group" : undefined} aria-label={label || undefined}><audio {src} controls preload="metadata" {autoplay} {loop} {muted} aria-label={label || undefined}><a href={src}>{label || src}</a></audio><span class="cm-bar">{@html controls}</span></span>
{/if}

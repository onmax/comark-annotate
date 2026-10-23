<!-- Videos and audio for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { addStyles } from "comark-media/client";

  let {
    kind = undefined,
    src = undefined,
    label = undefined,
    poster = undefined,
    autoplay = false,
    loop = false,
    muted = false,
  } = $props();
  onMount(addStyles);
</script>

{#if kind === "video" && src}
  <video class="cm" {src} controls playsinline preload="metadata" {poster} {autoplay} {loop} {muted} aria-label={label || undefined}><a href={src}>{label || src}</a></video>
{:else if kind === "audio" && src}
  <audio class="cm" {src} controls preload="metadata" {autoplay} {loop} {muted} aria-label={label || undefined}><a href={src}>{label || src}</a></audio>
{/if}

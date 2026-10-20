<!-- `::embed` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { addStyles, allow, referrerPolicy } from "comark-embed/client";

  let {
    provider = undefined,
    src = undefined,
    label = undefined,
    size = undefined,
    href = undefined,
    title = undefined,
    host = undefined,
  } = $props();
  onMount(addStyles);
</script>

{#if href && src}
  <figure class="ce" data-provider={provider} data-size={size}>
    <div class="ce-frame">
      <iframe {src} title={label} loading="lazy" {allow} allowfullscreen referrerpolicy={referrerPolicy}></iframe>
    </div>
    <figcaption><a {href}>{title}</a></figcaption>
  </figure>
{:else if href}
  <a class="ce-card" {href}><strong>{title}</strong><span>{host}</span></a>
{/if}

<!-- `::toc` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { addStyles } from "comark-toc/client";

  let { title = undefined, children } = $props();
  onMount(addStyles);
</script>

{#if children}
  <nav class="cto" aria-label={title || "Contents"}>
    {#if title}<p class="cto-title">{title}</p>{/if}
    {@render children()}
  </nav>
{/if}

<!-- `:icon` for `@comark/svelte`, and an icon for other plugins' components to draw. -->
<script>
  import { onMount } from "svelte";
  import { addStyles, iconStyle } from "comark-icon/client";

  let { src = undefined, ratio = undefined, mask = undefined, label = undefined } = $props();
  const style = $derived(
    src
      ? Object.entries(iconStyle(src, ratio))
          .map(([property, value]) => `${property}:${value}`)
          .join(";")
      : "",
  );
  onMount(addStyles);
</script>

{#if src}
  {#if label}
    <span class="ci" data-mask={mask ? "" : undefined} role="img" aria-label={label} {style}></span>
  {:else}
    <span class="ci" data-mask={mask ? "" : undefined} aria-hidden="true" {style}></span>
  {/if}
{/if}

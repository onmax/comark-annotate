<!-- `:::slide` for `@comark/svelte`. -->
<script>
  let { index = undefined, count = undefined, title = undefined, zoom = undefined, children } = $props();
  const zoomable = $derived(!(zoom === false || zoom === "false"));
</script>

<div
  class="cc-slide"
  role="group"
  aria-roledescription="slide"
  aria-label="{index} of {count}"
  data-zoom={zoomable ? "" : undefined}
  tabindex={zoomable ? 0 : undefined}
  data-zoom-title={zoomable ? title : undefined}
>
  {@render children?.()}
</div>

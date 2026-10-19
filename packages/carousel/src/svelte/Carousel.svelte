<!-- `::carousel` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { css, start } from "comark-carousel/client";
  import { css as zoomCss, start as startZoom } from "comark-zoom/client";

  let { count = 0, columns = 1, title = undefined, zoom = undefined, children } = $props();
  const off = (value) => value === false || value === "false";
  const total = $derived(Number(count) || 0);
  const perView = $derived(Math.min(3, Math.max(1, Number(columns) || 1)));

  onMount(() => {
    const stops = [start(css), ...(off(zoom) ? [] : [startZoom(zoomCss)])];
    return () => stops.forEach((stop) => stop());
  });
</script>

<div
  class="cc"
  data-columns={perView > 1 ? String(perView) : undefined}
  data-fits={total <= perView ? "" : undefined}
  data-zoom-gallery={off(zoom) ? undefined : ""}
  role="region"
  aria-roledescription="carousel"
  aria-label={title ?? "Carousel"}
>
  <div class="cc-track">{@render children?.()}</div>
  {#if total > 1}
    <div class="cc-controls">
      <button type="button" class="cc-step" data-carousel-step="-1" aria-label="Previous slide" disabled>&lsaquo;</button>
      <div class="cc-dots">
        {#each { length: total } as _, index (index)}
          <button type="button" class="cc-dot" data-carousel-to={String(index)} aria-label="Slide {index + 1}" aria-current={String(index === 0)}></button>
        {/each}
      </div>
      <button type="button" class="cc-step" data-carousel-step="1" aria-label="Next slide">&rsaquo;</button>
    </div>
  {/if}
</div>

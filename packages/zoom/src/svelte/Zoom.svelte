<!-- `::zoom` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { css, start } from "comark-zoom/client";

  let { group = undefined, title = undefined, children } = $props();
  onMount(() => start(css));
</script>

<div class="cz" data-zoom="" tabindex="0" data-zoom-group={group} data-zoom-title={title}>
  {@render children?.()}
</div>

<!-- `::zoom` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { start } from "comark-zoom/client";

  let {
    id = undefined,
    class: className = undefined,
    group = undefined,
    title = undefined,
    children,
  } = $props();
  onMount(() => start());
</script>

<div
  class={className ? `cz ${className}` : "cz"}
  {id}
  data-zoom=""
  tabindex="0"
  data-zoom-group={group}
  data-zoom-title={title}
>
  {@render children?.()}
</div>

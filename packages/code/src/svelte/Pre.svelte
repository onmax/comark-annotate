<!-- Code blocks for `@comark/svelte`. Everything but `actions` belongs to the `pre` itself. -->
<script>
  import { onMount } from "svelte";
  import { buttons, css, preAttributes, start } from "comark-code/client";

  let { actions = [], children, ...attrs } = $props();

  onMount(() => start(css));
</script>

<div class="ck">
  <pre {...preAttributes(attrs)}>{@render children?.()}</pre>
  <!-- Static markup built from escaped text, the same string every renderer uses. -->
  <div class="ck-bar">{@html buttons(actions)}</div>
</div>

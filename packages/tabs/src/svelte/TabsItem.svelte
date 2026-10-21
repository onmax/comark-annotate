<!-- `:::tabs-item` for `@comark/svelte`. -->
<script>
  import { getContext } from "svelte";
  import { Icon } from "comark-icon/svelte";

  let { label = undefined, icon = undefined, index = undefined, children } = $props();
  const id = getContext("comark-tabs") ?? "";
  const at = $derived(Number(index) || 1);
</script>

<div
  class="ct-panel"
  role="tabpanel"
  id="{id}-panel-{at}"
  aria-labelledby="{id}-tab-{at}"
  tabindex="0"
  data-inactive={at > 1 ? "" : undefined}
>
  <div class="ct-caption">{#if icon}<Icon {...icon} />{/if}{label}</div>
  {@render children?.()}
</div>

<!-- `::card` for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { addStyles, external as arrow, rel } from "comark-cards/client";
  import { Icon } from "comark-icon/svelte";

  let {
    color = "primary",
    to = undefined,
    target = undefined,
    external = undefined,
    label = undefined,
    icon = undefined,
    children,
  } = $props();
  onMount(addStyles);
</script>

<div class="ccr" data-color={color}>{#if to}<a class="ccr-link" href={to} target={target || undefined} rel={rel(target)} aria-label={label}></a>{/if}{#if icon?.src}<Icon {...icon} />{/if}{#if external}<svg class="ccr-external" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={arrow} /></svg>{/if}{@render children?.()}</div>

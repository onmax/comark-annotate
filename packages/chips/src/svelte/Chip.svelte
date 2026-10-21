<!-- A chip for `@comark/svelte`. -->
<script>
  import { onMount } from "svelte";
  import { addStyles } from "comark-chips/client";

  let { href = undefined, kind = undefined, src = undefined, title = undefined, children } = $props();
  onMount(addStyles);
</script>

<a class="cp" {href} data-kind={kind} {title}
  >{#if src}<img class="cp-img" {src} alt="" />{/if}{@render children?.()}</a
>

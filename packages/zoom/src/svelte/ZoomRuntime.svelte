<!-- Starts the zoom script for zoomable images. The plugin adds it to documents that need it. -->
<script>
  import { onMount } from "svelte";
  import { css, start } from "comark-zoom/client";

  onMount(() => start(css));
</script>

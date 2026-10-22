<template>
  <!-- One catch-all page serves every slug; the key makes each one mount, so its scripts start and stop with it. -->
  <NuxtPage :page-key="(route) => route.path" />
</template>

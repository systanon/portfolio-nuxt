<template>
  <SplashScreen v-if="!ready" @finished="ready = true" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <NotificationsHost />
  </ClientOnly>
</template>

<script setup lang="ts">
const ready = ref(false)
</script>

<style lang="scss">
@use '~/assets/scss/_theme.scss';
</style>

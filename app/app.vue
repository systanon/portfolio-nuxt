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
const config = useRuntimeConfig()
const route = useRoute()

useHead({
  titleTemplate: (chunk) =>
    chunk ? `${chunk} — Serhii Tustanovskyi` : 'Serhii Tustanovskyi',
})

useSeoMeta({
  description:
    'Serhii Tustanovskyi — Frontend Developer with 5+ years of experience building Vue.js and TypeScript applications. Portfolio, tech stack, and contact details.',
  ogSiteName: 'Serhii Tustanovskyi',
  ogType: 'website',
  ogImage: `${config.public.siteUrl}/og-image.webp`,
  ogUrl: computed(() => `${config.public.siteUrl}${route.path}`),
  twitterCard: 'summary_large_image',
})

const ready = ref(false)
</script>

<style lang="scss">
@use '~/assets/scss/main.scss';
</style>

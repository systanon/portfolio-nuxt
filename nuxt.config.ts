// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/style.scss" as *;',
        },
      },
    },
  },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-svg-sprite-icon', '@pinia/nuxt', '@vueuse/nuxt'],
  svgSprite: {
    input: '~/assets/icons',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/style.scss" as *;',
        },
      },
    },
    ssr: {
      noExternal: ['vue'],
    },
  },
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      apiBase: '/api',
      wsURL: process.env.WS_API,
    },
  },

  routeRules: {
    '/api/**': {
      proxy: process.env.GO_BACKEND_URL + '/**',
    },
  },
})

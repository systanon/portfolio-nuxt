// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
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
    apiInternal: process.env.GO_BACKEND_INTERNAL,
    public: {
      apiBase: process.env.API_BASE,
      wsURL: process.env.WS_API,
      apiURL: process.env.GO_BACKEND_URL,
      googleAuthURL: process.env.GOOGLE_AUTH_URL,
    },
  },

  routeRules: {
    '/api/**': process.env.GO_BACKEND_URL
      ? { proxy: `${process.env.GO_BACKEND_URL}/**` }
      : {},
  },
})

import type { $Fetch } from 'nitropack'
import { HTTPClient } from '~/lib/http.client'

export default defineNuxtPlugin({
  name: 'http-client',

  setup() {
    const config = useRuntimeConfig()
    const fetcher: $Fetch = $fetch.create({
      baseURL: import.meta.server ? config.apiInternal : config.public.apiBase,
    })
    const httpClient = new HTTPClient(fetcher)

    return {
      provide: {
        httpClient,
      },
    }
  },
})

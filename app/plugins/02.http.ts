import type { $Fetch } from 'nitropack'
import { API_URL } from '~/constants'
import {
  createAuthHeaderInterceptor,
  createAuthRefreshInterceptor,
} from '~/application/interceptors'
import { useAccess } from '~/composables/useAccess'
import { HTTPClient } from '~/lib/http.client'

export default defineNuxtPlugin({
  name: 'http-client',

  setup() {
    const config = useRuntimeConfig()
    const accsessToken = useAccess()
    const fetcher: $Fetch = $fetch.create({
      baseURL: import.meta.server ? config.apiInternal : config.public.apiBase,
    })
    const URL_EXCLUDE = [API_URL.refresh, API_URL.sign_in, API_URL.sign_up]
    const httpClient = new HTTPClient(fetcher)

    const authHeaderInterceptor = createAuthHeaderInterceptor(
      () => accsessToken.token.value,
    )
    const authRefreshInterceptor = createAuthRefreshInterceptor(
      httpClient,
      accsessToken.setToken,
      URL_EXCLUDE,
      API_URL.refresh,
    )
    httpClient.addRequestInterceptor(authHeaderInterceptor)
    httpClient.addErrorInterceptor(authRefreshInterceptor)

    return {
      provide: {
        httpClient,
      },
    }
  },
})

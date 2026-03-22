import type { $Fetch } from 'nitropack'
import { useAppStore } from '~/store/application'
import { API_URL } from '~/constants'
import { HTTPClient } from '~/lib/http.client'
import { AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'
import type { Profile } from '~/types/user.types'
import type { AuthResponse } from '~/types/auth'

export default defineNuxtPlugin({
  name: 'application-server',
  async setup() {
    const config = useRuntimeConfig()
    const appStore = useAppStore()

    const requestHeaders = useRequestHeaders()

    const fetcher: $Fetch = $fetch.create({
      baseURL: config.public.isVPS
        ? config.public.apiURL + config.public.apiBase
        : config.public.apiBase,
    })

    const httpClient = new HTTPClient(fetcher)

    const headers = new Headers(requestHeaders)

    const token = useCookie('access_token').value

    if (token) {
      headers.set('Authorization', token)
    }

    let profile = await httpClient.do<Profile>(API_URL.profile, {
      method: 'POST',
      headers,
    })

    if (profile instanceof AppSilentError) {
      const refreshRes = await httpClient.do<AuthResponse>(API_URL.refresh, {
        method: 'POST',
        headers,
      })
      if (refreshRes instanceof AppSuccess) {
        const { access_token } = refreshRes.data
        useCookie('access_token').value = access_token
        headers.set('Authorization', access_token)
        profile = await httpClient.do<Profile>(API_URL.profile, {
          method: 'POST',
          headers,
        })
      }
    }

    if (profile instanceof AppSuccess) {
      appStore.setProfile(structuredClone(profile.data))
    }
  },
})

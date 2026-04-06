import type { NitroFetchOptions } from 'nitropack'
import { useAppStore } from '~/store/application'

import { AppSuccess } from '~/types/app.types'

export default defineNuxtPlugin({
  name: 'application-server',
  dependsOn: ['application'],
  async setup() {
    const application = useApp()
    const httpClient = useHttpClient()
    const appStore = useAppStore()
    const reqHeaders = useRequestHeaders()

    const removeInterceptor = httpClient.addRequestInterceptor(
      (_url: string, options: NitroFetchOptions<'json'>) => {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        if (reqHeaders.cookie) headers.set('cookie', reqHeaders.cookie)

        options.headers = headers
      },
    )
    const profile = await application.getProfile()
    if (profile instanceof AppSuccess) {
      appStore.setProfile(structuredClone(profile.data))
    }
    removeInterceptor()
  },
})

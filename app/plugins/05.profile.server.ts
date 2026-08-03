import { createCookieForwardingInterceptor } from '~/application/interceptors'
import { useProfile } from '~/composables/useProfile'
import { useAppStore } from '~/store/application'

import { AppSuccess } from '~/types/app.types'

export default defineNuxtPlugin({
  name: 'profile-server',
  async setup() {
    const reqHeaders = useRequestHeaders()

    if (!reqHeaders.cookie) return

    const { $httpClient } = useNuxtApp()
    const { getProfile } = useProfile()
    const appStore = useAppStore()

    const cookieInterceptor = createCookieForwardingInterceptor(
      reqHeaders.cookie,
    )
    const removeInterceptor =
      $httpClient.addRequestInterceptor(cookieInterceptor)
    const profile = await getProfile()

    if (profile instanceof AppSuccess) {
      appStore.setProfile(structuredClone(profile.data))
    }
    removeInterceptor()
  },
})

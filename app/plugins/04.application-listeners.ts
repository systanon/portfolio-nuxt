import { useAppStore } from '~/store/application'
import { checkAccessCurrentRoute } from '~/router/checkAccessCurrentRoute'
import { eventBus } from '~/utils/event-bus'
import type { Profile } from '~/types/user.types'

export default defineNuxtPlugin({
  name: 'application-listeners',
  setup() {
    const { $api } = useNuxtApp()
    const router = useRouter()
    const appStore = useAppStore()

    eventBus.on('auth:logout', () => {
      appStore.clearProfile()
      checkAccessCurrentRoute(router, false)
    })

    eventBus.on('auth:login', (profile) => {
      appStore.setProfile(profile)
      router.push('/profile')
    })

    $api.sync.on('sync:login', (profile: Profile) => {
      appStore.setProfile(profile)
      checkAccessCurrentRoute(router, true)
    })

    $api.sync.on('sync:logout', () => {
      appStore.clearProfile()
      checkAccessCurrentRoute(router, false)
    })
  },
})

import { useAppStore } from '~/store/application'
import { checkAccessCurrentRoute } from '~/router/checkAccessCurrentRoute'
import { eventBus } from '~/utils/event-bus'

export default defineNuxtPlugin({
  name: 'application-listeners',
  setup() {
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
  },
})

import { useAppStore } from '~/store/application'
import { checkAccessCurrentRoute } from '~/router/checkAccessCurrentRoute'

export default defineNuxtPlugin({
  name: 'application-listeners',
  dependsOn: ['application'],
  setup() {
    const router = useRouter()
    const application = useApp()
    const appStore = useAppStore()

    application.on('auth:logout', () => {
      checkAccessCurrentRoute(router, appStore.isLogged)
    })
    application.on('auth:login', () => {
      router.push('/profile')
    })
  },
})

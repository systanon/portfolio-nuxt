import { useAppStore } from '~/store/application'
import { checkAccessCurrentRoute } from '~/router/checkAccessCurrentRoute'

export default defineNuxtPlugin({
  name: 'subscribers-client',
  dependsOn: ['application-client'],
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

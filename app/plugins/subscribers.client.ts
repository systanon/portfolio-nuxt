import { useAppStore } from '~/store/application'
import { checkAccessCurrentRoute } from '~/router/checkAccessCurrentRoute'
import type { ClientApplication } from '~/application/clientApplication'

export default defineNuxtPlugin({
  name: 'subscribers-client',
  dependsOn: ['application-client'],
  setup() {
    const router = useRouter()
    const application = useApp()
    const authService = useAuthService()
    const appStore = useAppStore()

    application.on('auth:logout', () => {
      checkAccessCurrentRoute(router, appStore.isLogged)
    })
    application.on('auth:login', () => {
      router.push('/profile')
    })
    // authService.on('auth-service:logged-out', () => {
    //   //TODO: check if user logged in. If logged need remove user data from store and check access to current route
    //   // checkAccessCurrentRoute(router, false)
    // })
  },
})

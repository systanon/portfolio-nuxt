import { useAppStore } from '~/store/application'

export default defineNuxtPlugin({
  name: 'application-listeners',
  dependsOn: ['application-init'],
  setup() {
    const router = useRouter()
    const application = useApp()
    const appStore = useAppStore()

    application.on('auth:logout', () => {
      checkAccessCurrentRoute(router, appStore.isLogged)
    })
    application.on('auth:login', () => {
      router.push({ name: 'profile' })
    })
  },
})

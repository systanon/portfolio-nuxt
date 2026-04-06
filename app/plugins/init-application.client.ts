import { animationController } from '~/animations/animationController'
import { useAppStore } from '~/store/application'

export default defineNuxtPlugin({
  name: 'init-application-client',
  async setup() {
    const application = useApp()
    const wsClient = useWS()

    wsClient.onOpen(onOpenCb)

    function onOpenCb() {
      const appStore = useAppStore()
      if (appStore.profile?.id) {
        wsClient.auth(appStore.profile.id)
      }
    }
    animationController.start(application.appLoading)
    await application.init()
    wsClient.connect()
  },
})

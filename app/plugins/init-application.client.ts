import { animationController } from '~/animations/animationController'
import { useAppStore } from '~/store/application'

export default defineNuxtPlugin({
  name: 'init-application-client',
  dependsOn: ['application'],
  async setup() {
    const application = useApp()
    const { $api } = useNuxtApp()
    function onOpenCb() {
      const appStore = useAppStore()
      if (appStore.profile?.id) {
        $api.ws.auth(appStore.profile.id)
      }
    }
    $api.ws.onOpen(onOpenCb)
    animationController.start(application.appLoading)
    await application.init()
    $api.ws.connect()
  },
})

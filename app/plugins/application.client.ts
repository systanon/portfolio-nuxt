import type { $Fetch } from 'nitropack'
import { createAuthRefreshInterceptor } from '#shared/api/interceptors/response/authRefreshInterceptor'
import { createAuthHeaderInterceptor } from '#shared/api/interceptors/request/authHeaderInterceptor'
import { ClientApplication } from '~/application/clientApplication'
import { animationController } from '~/animations/animationController'
import { HTTPClient } from '~/lib/http.client'
import { AuthService } from '~/application/services/shared/auth.service'
import { TodoService } from '~/application/services/shared/todo.service'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'
import { StatisticService } from '~/application/services/client/statistic.service'
import { UserService } from '~/application/services/shared/user.service'
import { WSService } from '~/application/services/client/ws.service'
import { API_URL } from '~/constants'
import { NotificationService } from '~/application/services/client/notification.service'
import { NotesService } from '~/application/services/shared/note.service'
import { createSyncModule } from '~/application/modules/client/sync.factory'

const URL_EXCLUDE = [API_URL.refresh, API_URL.sign_in, API_URL.sign_up]

export default defineNuxtPlugin({
  name: 'application-client',
  async setup() {
    const config = useRuntimeConfig()
    const accessToken = useCookie('access_token')
    const fetcher: $Fetch = $fetch.create({
      baseURL: import.meta.server ? config.apiInternal : config.public.apiBase,
    })
    const syncModule = createSyncModule()
    const notificationService = new NotificationService()

    const wsService = new WSService(config.public.wsURL)
    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(httpClient)
    const notesService = new NotesService(httpClient)
    const authService = new AuthService(httpClient)
    const userService = new UserService(httpClient)
    const statisticService = new StatisticService(httpClient)
    const application = new ClientApplication(
      todoService,
      notesService,
      authService,
      userService,
      statisticService,
      notificationService,
      syncModule,
      accessToken,
    )
    const authHeaderInterceptor = createAuthHeaderInterceptor(accessToken)
    const authRefreshInterceptor = createAuthRefreshInterceptor(
      application,
      URL_EXCLUDE,
    )

    const appStore = useAppStore()
    appStore.bindApplicationEvents(application)
    wsService.onOpen(onOpenCb)

    function onOpenCb() {
      const appStore = useAppStore()
      if (appStore.profile?.id) {
        wsService.auth(appStore.profile.id)
      }
    }

    httpClient.addRequestInterceptor(authHeaderInterceptor)

    httpClient.addErrorInterceptor(authRefreshInterceptor)
    animationController.start(application.appLoading)
    await application.init()
    wsService.connect()

    return {
      provide: {
        application: application,
        notification: notificationService,
        wsService: wsService,
        httpClient: httpClient,
      },
    }
  },
})

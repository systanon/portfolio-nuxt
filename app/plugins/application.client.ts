import type { $Fetch, NitroFetchOptions } from 'nitropack'
import { Application } from '~/application/application'
import {
  HTTPClient,
  isFetchError,
  type ErrorInterceptorContext,
  type RetryableOptions,
} from '~/lib/http.client'
import { AuthService } from '~/application/services/auth.service'
import { TodoService } from '~/application/services/todo.service'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'
import { StatisticService } from '~/application/services/statistic.service'
import { animationController } from '~/animations/animationController'
import { UserService } from '~/application/services/user.service'
import { WSClient } from '~/lib/ws.client'
import { API_URL } from '~/constants'
import { NotificationService } from '~/application/services/notification.service'

export default defineNuxtPlugin({
  name: 'application-client',
  async setup() {
    const config = useRuntimeConfig()

    const fetcher: $Fetch = $fetch.create({
      baseURL: config.public.apiBase,
    })
    const notificationService = new NotificationService()

    const wsClient = new WSClient(config.public.wsURL)
    wsClient.onOpen(onOpenCb)
    wsClient.connect()
    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(
      httpClient,
      wsClient,
      notificationService,
    )
    const authService = new AuthService(httpClient, wsClient)
    const userService = new UserService(httpClient, wsClient)
    const statisticService = new StatisticService(httpClient)
    const application = new Application(
      todoService,
      authService,
      userService,
      statisticService,
      notificationService,
    )

    function requestInterceptor(
      _url: string,
      options: NitroFetchOptions<'json'>,
    ): void {
      if (options.credentials !== 'include') return
      const token = useCookie('access_token').value
      if (!token) return
      const headers = new Headers(options.headers as HeadersInit | undefined)
      headers.set('Authorization', token)
      options.headers = headers
    }

    async function responseInterceptor(
      error: unknown,
      retry: () => Promise<unknown>,
      options: RetryableOptions,
      { url }: ErrorInterceptorContext,
    ): Promise<void | boolean> {
      if (url.includes(API_URL.refresh)) return

      const status = isFetchError(error) ? error.response.status : undefined
      if (status !== 401 || options._retry) return

      options._retry = true
      const response = await authService.refresh()
      if (response instanceof AppSuccess) return true
    }

    function onOpenCb() {
      const appStore = useAppStore()
      if (appStore.profile?.id) {
        wsClient.auth(appStore.profile.id)
      }
    }

    const appStore = useAppStore()
    appStore.bindApplicationEvents(application)

    httpClient.addRequestInterceptor(requestInterceptor)

    httpClient.addErrorInterceptor(responseInterceptor)

    animationController.start(application.appLoading)
    await application.init()
    return {
      provide: {
        appInstance: application,
        notification: notificationService,
      },
    }
  },
})

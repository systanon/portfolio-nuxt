import type { $Fetch } from 'nitropack'
import { Application } from '~/application/application'
import { HTTPClient, type RetryableOptions } from '~/lib/http.client'
import { AuthService } from '~/application/services/auth.service'
import { TodoService } from '~/application/services/todo.service'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'
import { StatisticService } from '~/application/services/statistic.service'
import { animationController } from '~/animations/animationController'
import { WSClient } from '~/lib/ws.client'

export default defineNuxtPlugin({
  name: 'application-client',
  async setup() {
    const config = useRuntimeConfig()

    const fetcher: $Fetch = $fetch.create({
      baseURL: config.public.apiBase,
    })

    const wsClient = new WSClient(config.public.wsURL)
    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(httpClient, wsClient)
    const authService = new AuthService(httpClient, wsClient)
    const statisticService = new StatisticService(httpClient)
    const application = new Application(
      todoService,
      authService,
      statisticService,
    )

    const appStore = useAppStore()
    appStore.bindApplicationEvents(application)

    httpClient.addRequestInterceptor((_url, options) => {
      if (options.credentials === 'include') {
        const token = useCookie('access_token').value
        const newHeaders = new Headers(options.headers)
        if (token) {
          newHeaders.set('Authorization', token)
          options.headers = newHeaders
        }
      }
    })

    httpClient.addErrorInterceptor(
      async (error, _retry, options: RetryableOptions) => {
        if (error?.response?.status === 401 && !options._retry) {
          options._retry = true
          const response = await authService.refresh()
          if (response instanceof AppSuccess) return true
        }
      },
    )

    animationController.start(application.appLoading)
    await application.init()
    wsClient.connect(appStore.profile?.id)
    return {
      provide: {
        appInstance: application,
      },
    }
  },
})

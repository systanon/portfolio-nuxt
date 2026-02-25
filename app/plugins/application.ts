import type { $Fetch } from 'nitropack'
import { Application } from '~/services/application.service'
import { HTTPClient, type RetryableOptions } from '~/lib/http.client'
import { AuthService } from '~/services/auth.service'
import { TodoService } from '~/services/todo.service'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'
import { StatisticService } from '~/services/statistic.service'

export default defineNuxtPlugin({
  name: 'application-init',
  async setup() {
    const config = useRuntimeConfig()
    let accessToken = useCookie('access_token').value

    const getToken = () => accessToken

    const setToken = (token: string) => {
      accessToken = token
      useCookie('access_token').value = token
    }

    const fetcher: $Fetch = $fetch.create({
      baseURL: config.public.apiBase,
    })
    const refreshClient = new HTTPClient(fetcher)
    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(httpClient)
    const authService = new AuthService(httpClient, refreshClient)
    const statisticService = new StatisticService(httpClient)
    const application = new Application(
      todoService,
      authService,
      statisticService,
    )

    const appStore = useAppStore()
    appStore.bindApplicationEvents(application)

    httpClient.addRequestInterceptor((url, options) => {
      if (options.credentials === 'include') {
        const token = getToken()
        const newHeaders = new Headers(options.headers)

        if (token) {
          newHeaders.set('Authorization', token)
          options.headers = newHeaders
        }
      }
    })

    httpClient.addErrorInterceptor(
      async (error, retry, options: RetryableOptions) => {
        if (error.response.status === 401 && !options._retry) {
          options._retry = true
          const response = await application.refresh()
          if (response instanceof AppSuccess) {
            const access_token = response.data.access_token
            setToken(access_token)
            return true
          }
        }
      },
    )

    application.getProfile()

    return {
      provide: {
        appInstance: application,
      },
    }
  },
})

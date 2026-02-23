import type { $Fetch } from 'nitropack'
import { Application } from '~/application/application'
import { HTTPClient, type RetryableOptions } from '~/lib/http.client'
import { AuthService } from '~/services/auth.service'
import { TodoService } from '~/services/todo.service'
import { AppSuccess } from '~/types/app.types'

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
    const application = new Application(todoService, authService)

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

    await application.getProfile()

    return {
      provide: {
        appInstance: application,
      },
    }
  },
})

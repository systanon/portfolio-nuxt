import type { $Fetch } from 'nitropack'
import { Application } from '~/application/application'
import { HTTPClient } from '~/lib/http.client'
import { TodoService } from '~/services/todo.service'

export default defineNuxtPlugin({
  name: 'application-init',
  async setup() {
    const config = useRuntimeConfig()

    const fetcher: $Fetch = $fetch.create({
      baseURL: config.public.apiBase,

      onRequest(ctx) {
        if (ctx.options.credentials === 'include') {
          const token = useCookie('access_token').value
          const newHeaders = new Headers(ctx.options.headers)
          if (token) {
            newHeaders.set('Authorization', token)
            ctx.options.headers = newHeaders
          }
        }
      },

      async onResponseError(ctx) {
        if (ctx.response.status === 401) {
          await $fetch('/auth/refresh', {
            baseURL: config.public.apiBase,
            method: 'POST',
            credentials: 'include',
          })

          return fetcher(ctx.request)
        }
      },
    })

    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(httpClient)

    const application = new Application(todoService)

    // await application.getProfile()

    return {
      provide: {
        appInstance: application,
      },
    }
  },
})

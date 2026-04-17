import type { $Fetch } from 'nitropack'
import { createAuthHeaderInterceptor } from '#shared/api/interceptors/request/authHeaderInterceptor'
import { createCookieForwardingInterceptor } from '#shared/api/interceptors/request/cookieProxyInterceptor'
import { createAuthRefreshInterceptor } from '#shared/api/interceptors/response/authRefreshInterceptor'

import { ServerApplication } from '~/application/serverApplication'
import { HTTPClient } from '~/lib/http.client'
import { AuthService } from '~/application/services/shared/auth.service'
import { TodoService } from '~/application/services/shared/todo.service'
import { useAppStore } from '~/store/application'
import { AppSuccess } from '~/types/app.types'
import { UserService } from '~/application/services/shared/user.service'
import { API_URL } from '~/constants'

import { NotesService } from '~/application/services/shared/note.service'

const URL_EXCLUDE = [API_URL.refresh, API_URL.sign_in, API_URL.sign_up]

export default defineNuxtPlugin({
  name: 'application-server',
  async setup() {
    const config = useRuntimeConfig()
    const accessToken = useCookie('access_token')
    const reqHeaders = useRequestHeaders()
    const fetcher: $Fetch = $fetch.create({
      baseURL: config.apiInternal,
    })

    const httpClient = new HTTPClient(fetcher)

    const todoService = new TodoService(httpClient)
    const notesService = new NotesService(httpClient)
    const authService = new AuthService(httpClient)
    const userService = new UserService(httpClient)
    const application = new ServerApplication(
      todoService,
      notesService,
      authService,
      userService,
      accessToken,
    )

    const authHeaderInterceptor = createAuthHeaderInterceptor(accessToken)
    const cookieProxyInterceptor = createCookieForwardingInterceptor(
      reqHeaders.cookie,
    )
    const authRefreshInterceptor = createAuthRefreshInterceptor(
      application,
      URL_EXCLUDE,
    )

    const appStore = useAppStore()
    appStore.bindApplicationEvents(application)

    httpClient.addRequestInterceptor(authHeaderInterceptor)
    httpClient.addRequestInterceptor(cookieProxyInterceptor)

    httpClient.addErrorInterceptor(authRefreshInterceptor)

    const profile = await application.getProfile()
    if (profile instanceof AppSuccess) {
      appStore.setProfile(structuredClone(profile.data))
    }
    return {
      provide: {
        application: application,
        httpClient: httpClient,
      },
    }
  },
})

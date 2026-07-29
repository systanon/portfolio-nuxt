import { NotesService } from '~/application/services/note.service'
import { TodoService } from '~/application/services/todo.service'
import { UserService } from '~/application/services/user.service'
import { AuthService } from '~/application/services/auth.service'
import { WSService } from '~/application/services/ws.service'
import { StatisticService } from '~/application/services/statistic.service'
import { TokenManager } from '~/application/token.manager'
import { AuthApplication } from '~/application/auth.application'
import { TodoApplication } from '~/application/todo.application'
import { NotesApplication } from '~/application/notes.application'
import { StatisticApplication } from '~/application/statistic.application'
import { API_URL } from '~/constants/apiUrl'
import {
  createAuthHeaderInterceptor,
  createAuthRefreshInterceptor,
} from '~/application/interceptors'
import { createSyncModule } from '~/application/modules/sync/sync.factory'
import type { SyncModule } from '~/application/modules/sync/sync.module'
import type { SyncModuleMock } from '~/application/modules/sync/sync.mock'

type ApiProvide = {
  provide: {
    api: {
      auth: AuthApplication
      user: UserService
      todo: TodoApplication
      notes: NotesApplication
      statistic: StatisticApplication
      ws: WSService
      sync: SyncModule | SyncModuleMock
    }
  }
}
export default defineNuxtPlugin({
  name: 'services',
  setup(): ApiProvide {
    const URL_EXCLUDE = [API_URL.refresh, API_URL.sign_in, API_URL.sign_up]

    const sync = createSyncModule()

    const { $httpClient, $notification } = useNuxtApp()
    const config = useRuntimeConfig()
    const accessToken = useCookie('access_token')
    const authService = new AuthService($httpClient)
    const tokenManager = new TokenManager(accessToken)
    const userService = new UserService($httpClient)
    const authApplication = new AuthApplication(
      authService,
      userService,
      tokenManager,
      $notification,
    )
    const todoApplication = new TodoApplication(
      new TodoService($httpClient),
      $notification,
    )
    const notesApplication = new NotesApplication(
      new NotesService($httpClient),
      $notification,
    )
    const statisticApplication = new StatisticApplication(
      new StatisticService($httpClient),
      $notification,
    )

    const authHeaderInterceptor = createAuthHeaderInterceptor(accessToken)
    const authRefreshInterceptor = createAuthRefreshInterceptor(
      authApplication,
      URL_EXCLUDE,
    )
    $httpClient.addRequestInterceptor(authHeaderInterceptor)
    $httpClient.addErrorInterceptor(authRefreshInterceptor)
    return {
      provide: {
        api: {
          auth: authApplication,
          user: userService,
          todo: todoApplication,
          notes: notesApplication,
          statistic: statisticApplication,
          ws: new WSService(config.public.wsURL),
          sync,
        },
      },
    }
  },
})

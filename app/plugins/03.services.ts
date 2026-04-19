import { NotesService } from '~/application/services/note.service'
import { TodoService } from '~/application/services/todo.service'
import { UserService } from '~/application/services/user.service'
import { AuthService } from '~/application/services/auth.service'
import { WSService } from '~/application/services/ws.service'
import { TokenManager } from '~/application/token.manager'
import { AuthApplication } from '~/application/auth.application'
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
      todo: TodoService
      notes: NotesService
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

    const { $httpClient } = useNuxtApp()
    const config = useRuntimeConfig()
    const accessToken = useCookie('access_token')
    const authService = new AuthService($httpClient)
    const tokenManager = new TokenManager(accessToken)
    const userService = new UserService($httpClient)
    const authApplication = new AuthApplication(
      authService,
      userService,
      tokenManager,
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
          todo: new TodoService($httpClient),
          notes: new NotesService($httpClient),
          ws: new WSService(config.public.wsURL),
          sync,
        },
      },
    }
  },
})

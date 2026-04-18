import { NotesService } from '~/application/services/note.service'
import { TodoService } from '~/application/services/todo.service'
import { UserService } from '~/application/services/user.service'
import { AuthService } from '~/application/services/auth.service'
import { WSService } from '~/application/services/ws.service'

type ApiProvide = {
  provide: {
    api: {
      auth: AuthService
      user: UserService
      todo: TodoService
      notes: NotesService
      ws: WSService
    }
  }
}
export default defineNuxtPlugin({
  name: 'services',
  setup(): ApiProvide {
    const { $httpClient } = useNuxtApp()
    const config = useRuntimeConfig()
    return {
      provide: {
        api: {
          auth: new AuthService($httpClient),
          user: new UserService($httpClient),
          todo: new TodoService($httpClient),
          notes: new NotesService($httpClient),
          ws: new WSService(config.public.wsURL),
        },
      },
    }
  },
})

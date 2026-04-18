import type { Application } from '~/application/application'
import type { NotificationModule } from '~/application/modules/notification/notification.module'
import type { HTTPClient } from '~/lib/http.client'
import type { AuthService } from '~/application/services/auth.service'
import type { UserService } from '~/application/services/user.service'
import type { TodoService } from '~/application/services/todo.service'
import type { NotesService } from '~/application/services/note.service'
import type { WSService } from '~/application/services/ws.service'

declare module '#app' {
  interface NuxtApp {
    $application: Application
    $notification: NotificationModule
    $httpClient: HTTPClient
    $api: {
      auth: AuthService
      user: UserService
      todo: TodoService
      notes: NotesService
      ws: WSService
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $appInstance: Application
    $notification: NotificationModule
  }
}

export {}

import type { Application } from '~/application/application'
import type { NotificationModule } from '~/application/modules/notification/notification.module'
import type { HTTPClient } from '~/lib/http.client'
import type { UserService } from '~/application/services/user.service'
import type { WSService } from '~/application/services/ws.service'
import type { AuthApplication } from '~/application/auth.application'
import type { TodoApplication } from '~/application/todo.application'
import type { NotesApplication } from '~/application/notes.application'
import type { StatisticApplication } from '~/application/statistic.application'
import type { SyncModule } from '~/application/modules/sync/sync.module'
import type { SyncModuleMock } from '~/application/modules/sync/sync.mock'

declare module '#app' {
  interface NuxtApp {
    $application: Application
    $notification: NotificationModule
    $httpClient: HTTPClient
    $api: {
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

declare module 'vue' {
  interface ComponentCustomProperties {
    $application: Application
    $notification: NotificationModule
  }
}

export {}

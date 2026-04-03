import type { Application } from '~/application/application'
import type { NotificationService } from '~/application/services/notification.service'

declare module '#app' {
  interface NuxtApp {
    $appInstance: Application
    $notification: NotificationService
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $appInstance: Application
    $notification: NotificationService
  }
}

export {}

import type { WSService } from '~/services/ws.service'

declare module '#app' {
  interface NuxtApp {
    $ws: WSService
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ws: WSService
  }
}

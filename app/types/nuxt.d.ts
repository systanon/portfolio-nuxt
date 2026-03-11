import type { WSService } from '~/lib/ws.client'

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

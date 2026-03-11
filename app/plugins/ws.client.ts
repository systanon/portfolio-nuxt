import { WSService } from '~/lib/ws.client'

export default defineNuxtPlugin({
  name: 'ws-init',

  setup() {
    const config = useRuntimeConfig()

    const ws = new WSService(config.public.wsURL)

    return {
      provide: {
        ws,
      },
    }
  },
})

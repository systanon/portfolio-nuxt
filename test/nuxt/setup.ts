import { vi } from 'vitest'

vi.mock('~/lib/ws.client', () => {
  return {
    WSClient: class MockWSClient {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_url: string) {}

      connect() {}
      onOpen() {}
      auth() {}
      unauth() {}
      destroy() {}
      subscribe() {
        return () => {}
      }
      emit() {}
    },
  }
})

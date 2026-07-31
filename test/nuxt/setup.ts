import { vi } from 'vitest'

vi.mock('~/lib/ws.client', () => {
  return {
    WSClient: class MockWSClient {
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

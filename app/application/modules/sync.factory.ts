import { SyncModule } from './sync.module'
import { SyncModuleMock } from './sync.mock'

export const createSyncModule = () => {
  if (import.meta.server || !window.SharedWorker) {
    return new SyncModuleMock()
  }

  return new SyncModule(
    new SharedWorker(new URL('./sync.worker.ts', import.meta.url), {
      type: 'module',
    }),
    { pingPongInterval: 1000, offlineInterval: 2000 },
  )
}

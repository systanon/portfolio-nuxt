import { describe, it, expect, afterEach } from 'vitest'
import { SyncModule } from '~/application/modules/sync/sync.module'
import { SyncEvent } from '~/types/sync'

// Long enough that the ping watcher never fires during a test run, so the
// module never flips itself to "master" behind our backs.
const LONG_INTERVAL = 60_000

type PostedMessage = {
  event: string
  data?: { type: SyncEvent; data: unknown }
  params?: unknown[]
}

function createMockSharedWorker() {
  const listeners: Record<string, Array<(ev: MessageEvent) => void>> = {}
  const posted: PostedMessage[] = []
  const port = {
    addEventListener: (type: string, cb: (ev: MessageEvent) => void) => {
      ;(listeners[type] ??= []).push(cb)
    },
    removeEventListener: (type: string, cb: (ev: MessageEvent) => void) => {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== cb)
    },
    start: () => {},
    close: () => {},
    postMessage: (msg: PostedMessage) => posted.push(msg),
  }
  const dispatch = (data: unknown) => {
    listeners.message?.forEach((cb) => cb({ data } as MessageEvent))
  }
  return {
    worker: { port } as unknown as SharedWorker,
    posted,
    dispatch,
  }
}

const created: SyncModule[] = []

function makeSync(
  worker: SharedWorker,
  config = { pingPongInterval: LONG_INTERVAL, offlineInterval: LONG_INTERVAL },
) {
  const sync = new SyncModule(worker, config)
  created.push(sync)
  return sync
}

afterEach(() => {
  created
    .splice(0)
    .forEach((s) => (s as unknown as { destroy(): void }).destroy())
})

describe('SyncModule', () => {
  it('emit() posts {event, params} through the worker port, skipping the internal "sync" event', () => {
    const { worker, posted } = createMockSharedWorker()
    const sync = makeSync(worker)

    sync.emit('hello', 1, 'two')
    expect(posted).toEqual([{ event: 'hello', params: [1, 'two'] }])

    sync.emit(SyncEvent.SYNC, 'should be skipped')
    expect(posted).toHaveLength(1)
  })

  it('assigns clientID from a CONNECT message', () => {
    const { worker, dispatch } = createMockSharedWorker()
    const sync = makeSync(worker)

    expect(sync.id).toBeNull()
    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.CONNECT, data: { clientID: 7 } },
    })
    expect(sync.id).toBe(7)
  })

  it('replies to PING with a PONG carrying the same id/timestamp', () => {
    const { worker, dispatch, posted } = createMockSharedWorker()
    makeSync(worker)

    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.PING, data: { id: 3, timestamp: 12345 } },
    })

    expect(posted).toContainEqual({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.PONG, data: { id: 3, timestamp: 12345 } },
    })
  })

  it('updates master state from MASTER messages', () => {
    const { worker, dispatch } = createMockSharedWorker()
    const sync = makeSync(worker)

    expect(sync.master).toBe(true)
    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.MASTER, data: { master: false } },
    })
    expect(sync.master).toBe(false)
    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.MASTER, data: { master: true } },
    })
    expect(sync.master).toBe(true)
  })

  it('on()/off() forward non-sync port messages to local listeners', () => {
    const { worker, dispatch } = createMockSharedWorker()
    const sync = makeSync(worker)

    const received: unknown[] = []
    const handler = (payload: unknown) => received.push(payload)
    sync.on('todos:update', handler)

    dispatch({ event: 'todos:update', params: [{ id: 1 }] })
    expect(received).toEqual([{ id: 1 }])

    sync.off('todos:update', handler)
    dispatch({ event: 'todos:update', params: [{ id: 2 }] })
    expect(received).toEqual([{ id: 1 }])
  })

  it('call() rejects immediately when this tab is master', async () => {
    const { worker } = createMockSharedWorker()
    const sync = makeSync(worker)

    await expect(sync.call('someProcedure')).rejects.toBe('this is master tab')
  })

  it('call() sends an RPC_REQUEST and resolves when the matching RPC_RESPONSE arrives', async () => {
    const { worker, dispatch, posted } = createMockSharedWorker()
    const sync = makeSync(worker)

    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.CONNECT, data: { clientID: 1 } },
    })
    dispatch({
      event: SyncEvent.SYNC,
      data: { type: SyncEvent.MASTER, data: { master: false } },
    })

    const promise = sync.call('doThing', 'a', 2)

    const request = posted.at(-1)
    const requestData = request?.data?.data as {
      clientID: number
      requestID: string
      procedureName: string
      params: unknown[]
    }
    expect(request?.data?.type).toBe(SyncEvent.RPC_REQUEST)
    expect(requestData.procedureName).toBe('doThing')
    expect(requestData.params).toEqual(['a', 2])

    dispatch({
      event: SyncEvent.SYNC,
      data: {
        type: SyncEvent.RPC_RESPONSE,
        data: {
          clientID: 1,
          requestID: requestData.requestID,
          state: 'resolve',
          result: 42,
        },
      },
    })

    await expect(promise).resolves.toBe(42)
  })

  it('register()/unregister() control which procedures answer incoming RPC_REQUESTs', async () => {
    const { worker, dispatch, posted } = createMockSharedWorker()
    const sync = makeSync(worker)

    // handleRPCRequest invokes the procedure with the whole params array as
    // a single argument (no spreading), so the handler destructures it.
    const unregister = sync.register('ping', (params: unknown) => {
      const [name] = params as unknown[]
      return `pong ${name}`
    })

    dispatch({
      event: SyncEvent.SYNC,
      data: {
        type: SyncEvent.RPC_REQUEST,
        data: {
          clientID: 9,
          requestID: 'req-1',
          procedureName: 'ping',
          params: ['x'],
        },
      },
    })
    await new Promise((r) => setTimeout(r, 0))

    const response = posted.at(-1)
    expect(response?.data?.type).toBe(SyncEvent.RPC_RESPONSE)
    expect(response?.data?.data).toMatchObject({
      requestID: 'req-1',
      state: 'resolve',
      result: 'pong x',
    })

    // Once unregistered, an incoming request for that procedure gets an
    // immediate reject instead of a misleading "resolve" with an empty result.
    unregister()
    posted.length = 0
    dispatch({
      event: SyncEvent.SYNC,
      data: {
        type: SyncEvent.RPC_REQUEST,
        data: {
          clientID: 9,
          requestID: 'req-2',
          procedureName: 'ping',
          params: ['y'],
        },
      },
    })
    await new Promise((r) => setTimeout(r, 0))
    const secondResponse = posted.at(-1)
    expect(secondResponse?.data?.type).toBe(SyncEvent.RPC_RESPONSE)
    expect(secondResponse?.data?.data).toMatchObject({
      requestID: 'req-2',
      state: 'reject',
      result: 'no procedure registered for "ping"',
    })
  })

  it('handleRPCRequest rejects immediately when no procedure was ever registered for the name', async () => {
    const { worker, dispatch, posted } = createMockSharedWorker()
    makeSync(worker)

    dispatch({
      event: SyncEvent.SYNC,
      data: {
        type: SyncEvent.RPC_REQUEST,
        data: {
          clientID: 5,
          requestID: 'req-unknown',
          procedureName: 'doesNotExist',
          params: [],
        },
      },
    })
    await new Promise((r) => setTimeout(r, 0))

    const response = posted.at(-1)
    expect(response?.data?.type).toBe(SyncEvent.RPC_RESPONSE)
    expect(response?.data?.data).toMatchObject({
      requestID: 'req-unknown',
      state: 'reject',
      result: 'no procedure registered for "doesNotExist"',
    })
  })
})

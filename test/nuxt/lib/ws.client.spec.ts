import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.unmock('~/lib/ws.client')

import { WSClient } from '~/lib/ws.client'

const createdSockets: MockWebSocket[] = []

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readonly url: string
  readyState = MockWebSocket.CONNECTING
  onopen: ((ev: Event) => void) | null = null
  onmessage: ((ev: MessageEvent) => void) | null = null
  onclose: ((ev: CloseEvent) => void) | null = null
  onerror: ((ev: Event) => void) | null = null
  readonly sent: string[] = []

  constructor(url: string) {
    this.url = url
    createdSockets.push(this)
    queueMicrotask(() => this.transitionToOpen())
  }

  private transitionToOpen() {
    if (this.readyState !== MockWebSocket.CONNECTING) return
    this.readyState = MockWebSocket.OPEN
    this.onopen?.(new Event('open'))
  }

  send(data: string) {
    this.sent.push(data)
  }

  simulateIncoming(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }))
  }

  close(code = 1000, reason = '') {
    if (this.readyState === MockWebSocket.CLOSED) return
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close', { code, reason }))
  }
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('WSClient', () => {
  beforeEach(() => {
    createdSockets.length = 0
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function lastSocket() {
    const s = createdSockets.at(-1)
    if (!s) throw new Error('No MockWebSocket created')
    return s
  }

  it('connect opens socket without sending auth on its own', async () => {
    const client = new WSClient('ws://api.test/ws')
    client.connect()
    await flushMicrotasks()

    expect(lastSocket().url).toBe('ws://api.test/ws')
    expect(lastSocket().sent).toEqual([])
  })

  it('runs onOpen callbacks after connection, then auth can send', async () => {
    const client = new WSClient('ws://api.test/ws')
    const onOpen = vi.fn()
    client.onOpen(onOpen)
    client.onOpen(() => client.auth(99))
    client.connect()
    await flushMicrotasks()

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(lastSocket().sent).toEqual([
      JSON.stringify({ event: 'auth', data: { user_id: 99 } }),
    ])
  })

  it('dispatches incoming JSON to handlers by topic', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    client.subscribe('todos', handler)
    client.connect()
    await flushMicrotasks()

    lastSocket().simulateIncoming(
      JSON.stringify({
        topic: 'todos',
        event: 'create',
        data: { id: 1 },
      }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0]?.[0]).toMatchObject({
      topic: 'todos',
      event: 'create',
      data: { id: 1 },
    })
  })

  it('dispatches to handlers registered on event name', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    client.subscribe('create', handler)
    client.connect()
    await flushMicrotasks()

    lastSocket().simulateIncoming(
      JSON.stringify({
        topic: 'todos',
        event: 'create',
        data: { id: 1 },
      }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('deduplicates handler call when topic and event strings match', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    client.subscribe('ping', handler)
    client.connect()
    await flushMicrotasks()

    lastSocket().simulateIncoming(
      JSON.stringify({
        topic: 'ping',
        event: 'ping',
        data: {},
      }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('unsubscribe stops further deliveries', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    const off = client.subscribe('todos', handler)
    client.connect()
    await flushMicrotasks()

    lastSocket().simulateIncoming(
      JSON.stringify({ topic: 'todos', event: 'x', data: null }),
    )
    expect(handler).toHaveBeenCalledTimes(1)

    off()
    lastSocket().simulateIncoming(
      JSON.stringify({ topic: 'todos', event: 'x', data: null }),
    )
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('ignores non-JSON payloads and JSON without topic or event', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    client.subscribe('todos', handler)
    client.connect()
    await flushMicrotasks()

    lastSocket().simulateIncoming('not json')
    lastSocket().simulateIncoming(JSON.stringify({ data: 1 }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('emit sends payload when socket is open', async () => {
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    client.emit('hello', { a: 1 })
    expect(lastSocket().sent.at(-1)).toBe(
      JSON.stringify({ event: 'hello', data: { a: 1 } }),
    )
  })

  it('unauth sends unauth event when open', async () => {
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    client.unauth()
    expect(lastSocket().sent.at(-1)).toBe(
      JSON.stringify({ event: 'unauth', data: {} }),
    )
  })

  it('runs onOpen again after reconnect', async () => {
    vi.useFakeTimers()
    const client = new WSClient('ws://x')
    const onOpen = vi.fn()
    client.onOpen(onOpen)
    client.connect()
    await flushMicrotasks()

    expect(onOpen).toHaveBeenCalledTimes(1)

    lastSocket().close(1000, 'bye')
    vi.advanceTimersByTime(1000)
    await flushMicrotasks()

    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('destroy closes socket and prevents reconnect', async () => {
    vi.useFakeTimers()
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    const first = lastSocket()
    client.destroy()
    expect(first.readyState).toBe(MockWebSocket.CLOSED)

    const countAfterDestroy = createdSockets.length
    vi.advanceTimersByTime(60_000)
    expect(createdSockets.length).toBe(countAfterDestroy)
  })

  it('schedules reconnect after close when not destroyed', async () => {
    vi.useFakeTimers()
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    expect(createdSockets).toHaveLength(1)
    lastSocket().close(1000, 'bye')

    vi.advanceTimersByTime(1000)
    await flushMicrotasks()

    expect(createdSockets.length).toBeGreaterThanOrEqual(2)
  })

  it('onOpen returns an unsubscribe function that stops future calls', async () => {
    const client = new WSClient('ws://x')
    const handler = vi.fn()
    const off = client.onOpen(handler)
    client.connect()
    await flushMicrotasks()

    expect(handler).toHaveBeenCalledTimes(1)

    off()

    vi.useFakeTimers()
    lastSocket().close(1000, 'bye')
    vi.advanceTimersByTime(1000)
    await flushMicrotasks()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('onOpen fires immediately when socket is already open (late subscription)', async () => {
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    const handler = vi.fn()
    client.onOpen(handler)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('destroy resets reconnectAttempts', async () => {
    vi.useFakeTimers()
    const client = new WSClient('ws://x')
    client.connect()
    await flushMicrotasks()

    lastSocket().close(4000, 'error')
    vi.advanceTimersByTime(1000)
    await flushMicrotasks()
    lastSocket().close(4000, 'error')
    vi.advanceTimersByTime(2000)
    await flushMicrotasks()

    client.destroy()

    const freshClient = new WSClient('ws://x')
    const onOpen = vi.fn()
    freshClient.onOpen(onOpen)
    freshClient.connect()
    await flushMicrotasks()

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})

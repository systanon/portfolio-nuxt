import { Logger } from '~/lib/logger'

const MAX_RECONNECT_DELAY_MS = 30_000
const BASE_RECONNECT_DELAY_MS = 1000

export type WSMessage<T = unknown> = {
  event?: string
  topic?: string
  data: T
  user_id?: number
}

export type WSHandler<T = unknown> = (message: WSMessage<T>) => void

export interface WSServiceLike {
  connect(): void
  onOpen(callback: () => void): void
  auth(user_id: number): void
  unauth(): void
  subscribe<T = unknown>(topic: string, handler: WSHandler<T>): () => void
  destroy?(): void
}

export class WSService implements WSServiceLike {
  private readonly handlers = new Map<string, Set<WSHandler>>()
  private ws: WebSocket | null = null
  private readonly url: string
  private reconnectAttempts = 0
  private isDestroyed = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private openCallbacks = new Set<() => void>()
  private logger = new Logger('WebSocketService')

  constructor(url: string) {
    this.url = url
  }

  connect() {
    if (this.isDestroyed) return

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (
      this.ws?.readyState === WebSocket.CONNECTING ||
      this.ws?.readyState === WebSocket.OPEN
    ) {
      return
    }

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.logger.log('Connected')

      this.openCallbacks.forEach((cb) => cb())
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event)
    }

    this.ws.onclose = (event) => {
      if (this.isDestroyed) {
        this.cleanupSocket()
        return
      }

      this.cleanupSocket()

      const delay = Math.min(
        BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts),
        MAX_RECONNECT_DELAY_MS,
      )
      this.logger.warn(
        `Closed (code ${event.code}). Reconnecting in ${delay}ms`,
        event.reason,
      )

      this.reconnectAttempts += 1
      this.reconnectTimer = setTimeout(() => this.connect(), delay)
    }

    this.ws.onerror = (event) => {
      this.logger.error('Socket error', event)
      this.ws?.close()
    }
  }

  private handleMessage(message: MessageEvent) {
    try {
      const payload: WSMessage = JSON.parse(message.data)
      this.logger.log(
        `Received "${payload.topic ?? payload.event}"`,
        payload.data,
      )
      const called = new Set<WSHandler>()

      if (payload.topic) {
        this.handlers.get(payload.topic)?.forEach((h) => {
          called.add(h)
          h(payload)
        })
      }
      if (payload.event) {
        this.handlers.get(payload.event)?.forEach((h) => {
          if (!called.has(h)) h(payload)
        })
      }
    } catch {
      this.logger.error('Ignored non-JSON or invalid message', message.data)
    }
  }

  emit<T>(event: string, data: T) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.logger.warn(`Cannot emit "${event}", socket not open`)
      return
    }
    this.ws.send(JSON.stringify({ event, data }))
  }

  auth(user_id: number) {
    this.emit('auth', { user_id })
  }

  private cleanupSocket() {
    if (!this.ws) return
    this.ws.onopen = null
    this.ws.onmessage = null
    this.ws.onclose = null
    this.ws.onerror = null
    this.ws = null
  }

  unauth() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.emit('unauth', {})
    }
  }

  onOpen(callback: () => void) {
    this.openCallbacks.add(callback)
    if (this.ws?.readyState === WebSocket.OPEN) {
      callback()
    }
    return () => this.openCallbacks.delete(callback)
  }

  destroy() {
    this.logger.log('Destroying connection')
    this.isDestroyed = true
    this.reconnectAttempts = 0
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.handlers.clear()
    if (!this.ws) return
    this.ws.close(1000, 'client destroyed')
    this.cleanupSocket()
  }

  subscribe<T>(topic: string, handler: WSHandler<T>) {
    const set = this.handlers.get(topic) ?? new Set<WSHandler>()
    set.add(handler as WSHandler)
    this.handlers.set(topic, set)
    this.logger.log(`Subscribed to "${topic}" (total: ${set.size})`)
    return () => this.unsubscribe(topic, handler)
  }

  unsubscribe<T>(topic: string, handler: WSHandler<T>) {
    const set = this.handlers.get(topic)
    if (!set) return
    set.delete(handler as WSHandler)
    this.logger.log(`Unsubscribed from "${topic}" (remaining: ${set.size})`)
    if (set.size === 0) this.handlers.delete(topic)
  }
}

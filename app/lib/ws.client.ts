import type { NotificationService } from '~/application/services/notification.service'

export type WSHandler<T = any> = (data: T) => void

export type WSMessage<T = any> = {
  event: string
  topic?: string
  data: T
  user_id?: number
}

export class WSClient {
  private readonly handlers = new Map<string, Set<WSHandler>>()
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private isDestroyed = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private notification: NotificationService | undefined

  constructor(url: string, notification?: NotificationService) {
    this.url = url
    this.notification = notification
  }

  public connect(user_id?: number) {
    if (this.isDestroyed) return
    if (
      this.ws?.readyState === WebSocket.CONNECTING ||
      this.ws?.readyState === WebSocket.OPEN
    )
      return

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      console.log('WS: Connected')

      if (user_id) {
        this.auth(user_id)
      }
    }

    this.ws.onmessage = (event) => this.handleMessage(event)

    this.ws.onclose = (e) => {
      if (this.isDestroyed) return
      this.cleanup()

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.warn(`WS: Closed. Reconnecting in ${delay}ms...`, e.reason)

      this.reconnectAttempts++
      this.reconnectTimer = setTimeout(() => this.connect(user_id), delay)
    }

    this.ws.onerror = (err) => {
      console.error('WS: Socket error', err)
      this.ws?.close()
    }
  }

  private handleMessage(message: MessageEvent) {
    try {
      const payload: WSMessage = JSON.parse(message.data)
      if (payload.topic) {
        this.handlers.get(payload.topic)?.forEach((h) => h(payload))
      }
      if (payload.event) {
        this.handlers.get(payload.event)?.forEach((h) => h(payload))
      }
    } catch (e) {
      console.warn('WS: Received non-JSON data')
    }
  }

  emit<T = any>(event: string, data: T) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WS: Cannot emit, socket not open')
      return
    }
    this.ws.send(JSON.stringify({ event, data }))
  }

  auth(user_id: number) {
    this.emit('auth', { user_id })
  }

  private cleanup() {
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws = null
    }
  }

  unauth() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.emit('unauth', {})
    }
  }

  destroy() {
    this.isDestroyed = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.handlers.clear()
    this.cleanup()
    console.log('WS Service Destroyed')
  }

  subscribe<T = any>(topic: string, handler: WSHandler<T>) {
    const handlers = this.handlers.get(topic) ?? new Set()
    handlers.add(handler as WSHandler)
    this.handlers.set(topic, handlers)
    return () => this.unsubscribe(topic, handler)
  }

  unsubscribe<T = any>(topic: string, handler: WSHandler<T>) {
    const handlers = this.handlers.get(topic)
    if (handlers) {
      handlers.delete(handler as WSHandler)
      if (handlers.size === 0) this.handlers.delete(topic)
    }
  }
}

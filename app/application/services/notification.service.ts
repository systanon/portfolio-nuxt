export type NotificationType = 'success' | 'error' | 'info'

export interface NotificationPayload {
  id: string
  type: NotificationType
  message: string
  durationMs: number
  pause: () => void
  resume: () => void
}

export class NotificationService {
  notifications = shallowReactive(new Map<string, NotificationPayload>())

  private timers = new Map<string, ReturnType<typeof setTimeout>>()

  notify(type: NotificationType, message: string, timeout = 8000) {
    const id = crypto.randomUUID()

    let remaining = timeout
    let lastStart = Date.now()

    const startTimer = () => {
      lastStart = Date.now()
      const existing = this.timers.get(id)
      if (existing) clearTimeout(existing)
      const t = setTimeout(() => {
        this.timers.delete(id)
        this.remove(id)
      }, remaining)
      this.timers.set(id, t)
    }

    const pause = () => {
      const t = this.timers.get(id)
      if (!t) return
      clearTimeout(t)
      this.timers.delete(id)
      remaining = Math.max(0, remaining - (Date.now() - lastStart))
    }

    const resume = () => {
      if (this.timers.has(id) || remaining <= 0) return
      startTimer()
    }

    const payload: NotificationPayload = {
      id,
      type,
      message,
      durationMs: timeout,
      pause,
      resume,
    }

    this.notifications.set(id, payload)

    if (timeout > 0) startTimer()

    return id
  }

  remove(id: string) {
    const t = this.timers.get(id)
    if (t) {
      clearTimeout(t)
      this.timers.delete(id)
    }
    this.notifications.delete(id)
  }

  clear() {
    for (const t of this.timers.values()) clearTimeout(t)
    this.timers.clear()
    this.notifications.clear()
  }
}

import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info'

export interface NotificationPayload {
  id: string
  type: NotificationType
  message: string
  pause: () => void
  resume: () => void
}

export class NotificationService {
  notifications = ref<Map<string, NotificationPayload>>(new Map())

  async notify(type: NotificationType, message: string, timeout = 8000) {
    const id = crypto.randomUUID()

    let remaining = timeout
    let timer: ReturnType<typeof setTimeout> | null = null
    let lastStart = Date.now()

    const remove = () => this.remove(id)

    const startTimer = () => {
      lastStart = Date.now()
      timer = setTimeout(remove, remaining)
    }

    const pause = () => {
      if (!timer) return
      clearTimeout(timer)
      timer = null
      remaining = Math.max(0, remaining - (Date.now() - lastStart))
    }

    const resume = () => {
      if (timer || remaining <= 0) return
      startTimer()
    }

    const payload: NotificationPayload = {
      id,
      type,
      message,
      pause,
      resume,
    }

    this.notifications.value.set(id, payload)
    this.notifications.value = new Map(this.notifications.value)

    if (timeout > 0) startTimer()

    return id
  }

  remove(id: string) {
    this.notifications.value.delete(id)
    this.notifications.value = new Map(this.notifications.value)
  }

  clear() {
    this.notifications.value.clear()
    this.notifications.value = new Map()
  }
}
